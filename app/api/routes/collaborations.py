from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, aliased

from app.api.dependencies import get_db, get_current_user
from app.models.collaboration import Collaboration, CollaborationStatus
from app.models.researcher import Researcher
from app.repositories.collaboration_repository import CollaborationRepository
from app.schemas.collaboration import CollaborationCreate, CollaborationUpdate
from app.services.collaboration_service import CollaborationService
from app.models.user import User
from sqlalchemy import or_,func
from app.models.publication import Publication
import csv
import io


router = APIRouter(
    prefix="/collaborations",
    tags=["Collaborations"],
)


# ============================================================
# CREATE
# ============================================================

@router.post("/")
def create_collaboration(
    data: CollaborationCreate,
    db: Session = Depends(get_db),
):
    return CollaborationService.create(db, data)


# ============================================================
# SEND REQUEST
# ============================================================

@router.post("/request")
def send_request(
    data: CollaborationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return CollaborationService.send_request(
        db=db,
        sender_id=current_user.id,
        receiver_id=data.receiver_id,
        publication_id=data.publication_id,
        collaboration_type=data.collaboration_type,
        description=data.description,
    )


# ============================================================
# NETWORK GRAPH
# IMPORTANT: Keep these routes BEFORE /{collaboration_id}
# ============================================================

def _researcher_name(researcher: Researcher) -> str:
    return (
        f"{researcher.first_name or ''} "
        f"{researcher.last_name or ''}"
    ).strip() or "Unknown Researcher"


def _build_network(
    db: Session,
    scope: str,
    current_user: User,
):
    """
    Build the collaboration graph using researcher IDs.

    Existing collaboration records may contain either:
        - Researcher.id
        - Researcher.user_id

    Resolve both forms to the correct researcher so that
    older database records continue to work.
    """

    researchers = db.query(Researcher).all()

    # --------------------------------------------------------
    # Collaboration sender_id / receiver_id store User.id.
    # Build the lookup using Researcher.user_id so the graph
    # can resolve the collaboration to the correct researcher.
    # --------------------------------------------------------

    researcher_by_user_id = {
        str(researcher.user_id): researcher
        for researcher in researchers
    }


    # --------------------------------------------------------
    # Find current user's researcher profile
    # --------------------------------------------------------

    current_researcher = next(
        (
            researcher
            for researcher in researchers
            if str(researcher.user_id)
            == str(current_user.id)
        ),
        None,
    )


    # --------------------------------------------------------
    # My network requires researcher profile
    # --------------------------------------------------------

    if scope == "mine" and current_researcher is None:

        raise HTTPException(
            status_code=404,
            detail="Researcher profile not found.",
        )


    # --------------------------------------------------------
    # Only accepted collaborations are network connections
    # --------------------------------------------------------

    collaborations = (
        db.query(Collaboration)
        .filter(
            Collaboration.status
            == CollaborationStatus.ACCEPTED
        )
        .all()
    )


    # --------------------------------------------------------
    # Build nodes
    # --------------------------------------------------------

    nodes_by_id = {}


    # For "all", display every researcher.
    # This means researchers without collaborations
    # are also visible in the graph.

    if scope == "all":

        for researcher in researchers:

            researcher_id = str(researcher.id)

            nodes_by_id[researcher_id] = {
                "id": researcher_id,
                "name": _researcher_name(researcher),
            }


    # For "mine", start with the current researcher.

    elif current_researcher:

        researcher_id = str(
            current_researcher.id
        )

        nodes_by_id[researcher_id] = {
            "id": researcher_id,
            "name": _researcher_name(
                current_researcher
            ),
        }


    # --------------------------------------------------------
    # Build collaboration links
    # --------------------------------------------------------

    links = []


    for collaboration in collaborations:

        sender = researcher_by_user_id.get(
            str(collaboration.sender_id)
        )

        receiver = researcher_by_user_id.get(
            str(collaboration.receiver_id)
        )


        # Ignore broken/orphaned records.

        if sender is None or receiver is None:
            continue


        # ----------------------------------------------------
        # "mine" scope
        # ----------------------------------------------------

        if scope == "mine":

            current_user_id = str(
                current_user.id
            )

            if (
                str(collaboration.sender_id) != current_user_id
                and
                str(collaboration.receiver_id) != current_user_id
            ):
                continue


        sender_id = str(sender.id)
        receiver_id = str(receiver.id)


        # ----------------------------------------------------
        # Add sender node
        # ----------------------------------------------------

        nodes_by_id[sender_id] = {
            "id": sender_id,
            "name": _researcher_name(sender),
        }


        # ----------------------------------------------------
        # Add receiver node
        # ----------------------------------------------------

        nodes_by_id[receiver_id] = {
            "id": receiver_id,
            "name": _researcher_name(receiver),
        }


        # ----------------------------------------------------
        # Convert enum values to strings
        # ----------------------------------------------------

        collaboration_type = (
            collaboration.collaboration_type
        )

        if hasattr(
            collaboration_type,
            "value"
        ):
            collaboration_type = (
                collaboration_type.value
            )


        status = collaboration.status

        if hasattr(status, "value"):
            status = status.value


        # ----------------------------------------------------
        # Add graph connection
        # ----------------------------------------------------

        links.append(
            {
                "id": str(
                    collaboration.id
                ),

                "source": sender_id,

                "target": receiver_id,

                "collaboration_type": str(
                    collaboration_type
                ),

                "status": str(
                    status
                ),
            }
        )


    # --------------------------------------------------------
    # Return graph
    # --------------------------------------------------------

    return {
        "nodes": list(
            nodes_by_id.values()
        ),

        "links": links,

        "statistics": {
            "researchers": len(
                nodes_by_id
            ),

            "collaborations": len(
                links
            ),
        },
    }


# ============================================================
# COLLABORATION NETWORK
# ============================================================

def _get_researcher_name(researcher: Researcher) -> str:
    name = (
        f"{researcher.first_name or ''} "
        f"{researcher.last_name or ''}"
    ).strip()

    return name or "Unknown Researcher"


def _build_researcher_lookup(
    db: Session,
):
    """
    Build a lookup that can resolve both:

        Researcher.id
        Researcher.user_id

    This is important because older collaboration records
    may contain User IDs while newer records should contain
    Researcher IDs.
    """

    researchers = (
        db.query(Researcher)
        .all()
    )

    # Collaboration.sender_id and receiver_id reference users.id.
    # Therefore use Researcher.user_id as the lookup key.
    lookup = {
        str(researcher.user_id): researcher
        for researcher in researchers
    }

    return researchers, lookup


@router.get("/network")
def get_collaboration_network(
    scope: str = Query(
        "all",
        pattern="^(all|mine)$",
    ),

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    # --------------------------------------------------------
    # Load researchers
    # --------------------------------------------------------

    researchers, researcher_lookup = (
        _build_researcher_lookup(db)
    )


    # --------------------------------------------------------
    # Create researcher nodes
    # --------------------------------------------------------

    nodes = {}

    for researcher in researchers:

        researcher_id = str(
            researcher.id
        )

        nodes[researcher_id] = {
            "id": researcher_id,
            "name": _get_researcher_name(
                researcher
            ),
        }


    # --------------------------------------------------------
    # Find current user's researcher
    # --------------------------------------------------------

    current_researcher = next(
        (
            researcher
            for researcher in researchers
            if str(researcher.user_id)
            == str(current_user.id)
        ),
        None,
    )


    if (
        scope == "mine"
        and current_researcher is None
    ):

        raise HTTPException(
            status_code=404,
            detail="Researcher profile not found.",
        )


    # --------------------------------------------------------
    # Get accepted collaborations
    # --------------------------------------------------------

    collaborations = (
        db.query(Collaboration)
        .filter(
            Collaboration.status
            == CollaborationStatus.ACCEPTED
        )
        .all()
    )


    links = []


    # --------------------------------------------------------
    # Convert collaborations into graph links
    # --------------------------------------------------------

    for collaboration in collaborations:

        # Collaboration sender_id / receiver_id are User IDs.
        # Resolve them through Researcher.user_id.
        sender = researcher_lookup.get(
            str(collaboration.sender_id)
        )

        receiver = researcher_lookup.get(
            str(collaboration.receiver_id)
        )


        # Ignore broken records instead of
        # crashing the entire graph.

        if sender is None:
            print(
                "Network warning: unable to resolve "
                f"sender {collaboration.sender_id} "
                f"for collaboration {collaboration.id}"
            )

            continue


        if receiver is None:
            print(
                "Network warning: unable to resolve "
                f"receiver {collaboration.receiver_id} "
                f"for collaboration {collaboration.id}"
            )

            continue


        # ----------------------------------------------------
        # MY NETWORK
        # ----------------------------------------------------

        if scope == "mine":

            current_user_id = str(
                current_user.id
            )

            if (
                str(collaboration.sender_id)
                != current_user_id
                and
                str(collaboration.receiver_id)
                != current_user_id
            ):

                continue


        # ----------------------------------------------------
        # Collaboration type
        # ----------------------------------------------------

        collaboration_type = (
            collaboration.collaboration_type
        )

        if hasattr(
            collaboration_type,
            "value",
        ):
            collaboration_type = (
                collaboration_type.value
            )


        # ----------------------------------------------------
        # Status
        # ----------------------------------------------------

        status = (
            collaboration.status
        )

        if hasattr(
            status,
            "value",
        ):
            status = status.value


        # ----------------------------------------------------
        # Add link
        # ----------------------------------------------------

        links.append(
            {
                "id": str(
                    collaboration.id
                ),

                "source": str(
                    sender.id
                ),

                "target": str(
                    receiver.id
                ),

                "collaboration_type": str(
                    collaboration_type
                ),

                "status": str(
                    status
                ),
            }
        )


    # --------------------------------------------------------
    # For "mine", only show researchers actually
    # participating in the network.
    #
    # For "all", show all researchers.
    # --------------------------------------------------------

    if scope == "mine":

        visible_ids = set()

        for link in links:

            visible_ids.add(
                link["source"]
            )

            visible_ids.add(
                link["target"]
            )

        visible_nodes = [
            node
            for node in nodes.values()
            if node["id"] in visible_ids
        ]

    else:

        visible_nodes = list(
            nodes.values()
        )


    # --------------------------------------------------------
    # Return network
    # --------------------------------------------------------

    return {
        "nodes": visible_nodes,

        "links": links,

        "statistics": {
            "researchers": len(
                visible_nodes
            ),

            "collaborations": len(
                links
            ),
        },
    }


# ============================================================
# EXPORT NETWORK AS CSV
# ============================================================

@router.get("/network/export")
def export_collaboration_network(
    scope: str = Query(
        "all",
        pattern="^(all|mine)$"
    ),

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    network = _build_network(
        db=db,
        scope=scope,
        current_user=current_user,
    )


    output = io.StringIO()

    writer = csv.writer(output)


    # CSV header

    writer.writerow(
        [
            "Researcher 1",
            "Researcher 2",
            "Collaboration Type",
            "Status",
        ]
    )


    # --------------------------------------------------------
    # Create researcher lookup
    # --------------------------------------------------------

    node_map = {
        node["id"]: node["name"]
        for node in network["nodes"]
    }


    # --------------------------------------------------------
    # Write collaboration rows
    # --------------------------------------------------------

    for link in network["links"]:

        writer.writerow(
            [
                node_map.get(
                    link["source"],
                    "Unknown Researcher"
                ),

                node_map.get(
                    link["target"],
                    "Unknown Researcher"
                ),

                link.get(
                    "collaboration_type",
                    ""
                ),

                link.get(
                    "status",
                    ""
                ),
            ]
        )


    output.seek(0)


    return StreamingResponse(
        iter(
            [output.getvalue()]
        ),

        media_type="text/csv",

        headers={
            "Content-Disposition":
                'attachment; filename="research_collaborations.csv"'
        },
    )


# ============================================================
# GET ALL COLLABORATIONS
# ============================================================

@router.get("/")
def get_all_collaborations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return CollaborationService.get_all(db)


# ============================================================
# PENDING REQUESTS
# IMPORTANT: BEFORE /{collaboration_id}
# ============================================================

@router.get("/pending")
def get_pending_requests(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return CollaborationService.get_pending_requests(
        db,
        current_user.id,
    )

# ============================================================
# COLLABORATION STATISTICS
# IMPORTANT: Keep this BEFORE /{collaboration_id}
# ============================================================

@router.get("/stats")
def get_collaboration_stats(
    db: Session = Depends(get_db),
):
    """
    Return real collaboration statistics and recent accepted
    collaborations for the dashboard.

    Internal = both researchers belong to at least one common
    institution through their departments.
    External = otherwise.
    """

    accepted = (
        db.query(Collaboration)
        .filter(
            Collaboration.status == CollaborationStatus.ACCEPTED
        )
        .order_by(Collaboration.created_at.desc())
        .all()
    )

    pending_count = (
        db.query(Collaboration)
        .filter(
            Collaboration.status == CollaborationStatus.PENDING
        )
        .count()
    )

    internal_count = 0
    external_count = 0
    recent = []

    for collaboration in accepted:
        sender = (
            db.query(Researcher)
            .filter(
                Researcher.user_id == collaboration.sender_id
            )
            .first()
        )

        receiver = (
            db.query(Researcher)
            .filter(
                Researcher.user_id == collaboration.receiver_id
            )
            .first()
        )

        if sender is None or receiver is None:
            continue

        sender_institutions = {
            department.institution_id
            for department in sender.departments
            if department.institution_id is not None
        }

        receiver_institutions = {
            department.institution_id
            for department in receiver.departments
            if department.institution_id is not None
        }

        collaboration_type = (
            "Internal"
            if sender_institutions.intersection(
                receiver_institutions
            )
            else "External"
        )

        if collaboration_type == "Internal":
            internal_count += 1
        else:
            external_count += 1

        publication = None

        if collaboration.publication_id:
            publication = (
                db.query(Publication)
                .filter(
                    Publication.id
                    == collaboration.publication_id
                )
                .first()
            )

        sender_name = (
            f"{sender.first_name or ''} "
            f"{sender.last_name or ''}"
        ).strip() or "Unknown Researcher"

        receiver_name = (
            f"{receiver.first_name or ''} "
            f"{receiver.last_name or ''}"
        ).strip() or "Unknown Researcher"

        status_value = collaboration.status
        if hasattr(status_value, "value"):
            status_value = status_value.value

        type_value = collaboration.collaboration_type
        if hasattr(type_value, "value"):
            type_value = type_value.value

        recent.append(
            {
                "id": str(collaboration.id),
                "researcher": sender_name,
                "collaborator": receiver_name,
                "publication": (
                    publication.title
                    if publication
                    else None
                ),
                "year": (
                    publication.publication_year
                    if publication
                    else (
                        collaboration.created_at.year
                        if collaboration.created_at
                        else None
                    )
                ),
                "type": collaboration_type,
                "status": str(status_value),
                "collaboration_type": str(type_value),
                "created_at": (
                    collaboration.created_at.isoformat()
                    if collaboration.created_at
                    else None
                ),
            }
        )

    return {
        "total": len(accepted),
        "collaborations": len(accepted),
        "internal": internal_count,
        "external": external_count,
        "pending_collaborations": pending_count,
        "recent": recent[:5],
    }


# ============================================================
# SENT PENDING REQUESTS
# ============================================================

@router.get("/requests/sent")
def get_sent_requests(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    collaborations = (
        db.query(Collaboration)
        .filter(
            Collaboration.sender_id == current_user.id,
            Collaboration.status == CollaborationStatus.PENDING,
        )
        .all()
    )

    return [
        collaboration_to_dict(db, collaboration)
        for collaboration in collaborations
    ]

# ============================================================
# RECEIVED PENDING REQUESTS
# ============================================================

@router.get("/requests/received")
def get_received_requests(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    collaborations = (
        db.query(Collaboration)
        .filter(
            Collaboration.receiver_id == current_user.id,
            Collaboration.status == CollaborationStatus.PENDING,
        )
        .all()
    )

    return [
        collaboration_to_dict(db, collaboration)
        for collaboration in collaborations
    ]


# ============================================================
# ACCEPTED COLLABORATIONS
# ============================================================

@router.get("/requests/accepted")
def get_accepted_requests(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    collaborations = (
        db.query(Collaboration)
        .filter(
            Collaboration.status == CollaborationStatus.ACCEPTED,
            (
                (Collaboration.sender_id == current_user.id)
                |
                (Collaboration.receiver_id == current_user.id)
            ),
        )
        .all()
    )

    return [
        collaboration_to_dict(db, collaboration)
        for collaboration in collaborations
    ]

# ============================================================
# SEARCH RESEARCHERS FOR COLLABORATION
# ============================================================

@router.get("/researchers/search")
def search_researchers(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    search = f"%{q.strip()}%"

    current_researcher = (
        db.query(Researcher)
        .filter(
            Researcher.user_id == current_user.id
        )
        .first()
    )

    query = (
        db.query(Researcher)
        .outerjoin(
            Researcher.publications
        )
        .filter(
            or_(
                Researcher.first_name.ilike(search),
                Researcher.last_name.ilike(search),
                Researcher.skills.ilike(search),
                Researcher.interests.ilike(search),
                Researcher.bio.ilike(search),
                Publication.title.ilike(search),
                Publication.abstract.ilike(search),
            )
        )
    )

    # Don't show the currently logged-in researcher
    if current_researcher:
        query = query.filter(
            Researcher.id != current_researcher.id
        )

    researchers = (
        query
        .distinct()
        .limit(20)
        .all()
    )

    return [
        {
            "researcher_id": str(researcher.id),
            "user_id": str(researcher.user_id),
            "name": (
                f"{researcher.first_name or ''} "
                f"{researcher.last_name or ''}"
            ).strip(),
            "skills": researcher.skills or "",
            "interests": researcher.interests or "",
            "bio": researcher.bio or "",
        }
        for researcher in researchers
    ]


# ============================================================
# GET ONE COLLABORATION
# ============================================================

@router.get("/{collaboration_id}")
def get_collaboration(
    collaboration_id: UUID,
    db: Session = Depends(get_db),
):
    return CollaborationService.get(
        db,
        collaboration_id,
    )



# ============================================================
# UPDATE
# ============================================================

@router.put("/{collaboration_id}")
def update_collaboration(
    collaboration_id: UUID,
    data: CollaborationUpdate,
    db: Session = Depends(get_db),
):
    return CollaborationService.update(
        db,
        collaboration_id,
        data,
    )


# ============================================================
# DELETE
# ============================================================

@router.delete("/{collaboration_id}")
def delete_collaboration(
    collaboration_id: UUID,
    db: Session = Depends(get_db),
):
    return CollaborationService.delete(
        db,
        collaboration_id,
    )


# ============================================================
# ACCEPT
# ============================================================

@router.put("/{collaboration_id}/accept")
def accept_request(
    collaboration_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    collaboration = (
        CollaborationRepository.get_by_id(
            db,
            collaboration_id,
        )
    )

    if collaboration is None:
        raise HTTPException(
            status_code=404,
            detail="Collaboration request not found",
        )

    return CollaborationService.accept_request(
        db,
        collaboration,
    )


# ============================================================
# REJECT
# ============================================================

@router.put("/{collaboration_id}/reject")
def reject_request(
    collaboration_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    collaboration = (
        CollaborationRepository.get_by_id(
            db,
            collaboration_id,
        )
    )

    if collaboration is None:
        raise HTTPException(
            status_code=404,
            detail="Collaboration request not found",
        )

    return CollaborationService.reject_request(
        db,
        collaboration,
    )

@staticmethod
def get_sent_pending_requests(
    db: Session,
    current_user_id: UUID,
):
    return (
        db.query(Collaboration)
        .filter(
            Collaboration.sender_id == current_user_id,
            Collaboration.status == CollaborationStatus.PENDING,
        )
        .all()
    )


@staticmethod
def get_received_pending_requests(
    db: Session,
    current_user_id: UUID,
):
    return (
        db.query(Collaboration)
        .filter(
            Collaboration.receiver_id == current_user_id,
            Collaboration.status == CollaborationStatus.PENDING,
        )
        .all()
    )


@staticmethod
def get_accepted_collaborations(
    db: Session,
    current_user_id: UUID,
):
    return (
        db.query(Collaboration)
        .filter(
            Collaboration.status == CollaborationStatus.ACCEPTED,
            (
                (Collaboration.sender_id == current_user_id)
                |
                (Collaboration.receiver_id == current_user_id)
            ),
        )
        .all()
    )
@staticmethod
def collaboration_to_dict(
    db: Session,
    collaboration: Collaboration,
):
    sender = (
        db.query(Researcher)
        .filter(
            Researcher.user_id == collaboration.sender_id
        )
        .first()
    )

    receiver = (
        db.query(Researcher)
        .filter(
            Researcher.user_id == collaboration.receiver_id
        )
        .first()
    )

    sender_name = (
        f"{sender.first_name} {sender.last_name}".strip()
        if sender
        else "Unknown Researcher"
    )

    receiver_name = (
        f"{receiver.first_name} {receiver.last_name}".strip()
        if receiver
        else "Unknown Researcher"
    )

    return {
        "id": str(collaboration.id),

        "sender_id": str(
            collaboration.sender_id
        ),

        "receiver_id": str(
            collaboration.receiver_id
        ),

        "sender_name": sender_name,

        "receiver_name": receiver_name,

        "publication_id": (
            str(collaboration.publication_id)
            if collaboration.publication_id
            else None
        ),

        "collaboration_type": (
            collaboration.collaboration_type.value
            if hasattr(
                collaboration.collaboration_type,
                "value"
            )
            else str(
                collaboration.collaboration_type
            )
        ),

        "status": (
            collaboration.status.value
            if hasattr(
                collaboration.status,
                "value"
            )
            else str(
                collaboration.status
            )
        ),

        "description": collaboration.description,
    }
