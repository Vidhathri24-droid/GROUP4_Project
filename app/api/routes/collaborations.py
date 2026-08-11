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

@router.get("/network")
def get_collaboration_network(
    scope: str = "all",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return researcher collaboration network.

    scope=all
        All researcher collaborations.

    scope=mine
        Only collaborations involving the current user.
    """

    Sender = aliased(Researcher)
    Receiver = aliased(Researcher)

    query = (
        db.query(
            Collaboration,
            Sender,
            Receiver,
        )
        .join(
            Sender,
            Sender.id == Collaboration.sender_id,
        )
        .join(
            Receiver,
            Receiver.id == Collaboration.receiver_id,
        )
    )

    # Only accepted collaborations are active connections
    query = query.filter(
        Collaboration.status == "Accepted"
    )

    # Current user's collaboration network
    if scope == "mine":
        current_researcher = (
            db.query(Researcher)
            .filter(
                Researcher.user_id == current_user.id
            )
            .first()
        )

        if current_researcher is None:
            raise HTTPException(
                status_code=404,
                detail="Researcher profile not found.",
            )

        query = query.filter(
            (
                Collaboration.sender_id
                == current_researcher.id
            )
            |
            (
                Collaboration.receiver_id
                == current_researcher.id
            )
        )

    results = query.all()

    nodes = {}
    edges = []

    for collaboration, sender, receiver in results:

        # Sender node
        nodes[str(sender.id)] = {
            "id": str(sender.id),
            "name": (
                f"{sender.first_name or ''} "
                f"{sender.last_name or ''}"
            ).strip(),
        }

        # Receiver node
        nodes[str(receiver.id)] = {
            "id": str(receiver.id),
            "name": (
                f"{receiver.first_name or ''} "
                f"{receiver.last_name or ''}"
            ).strip(),
        }

        # Connection
        edges.append({
            "id": str(collaboration.id),
            "source": str(sender.id),
            "target": str(receiver.id),
            "collaboration_type": getattr(
                collaboration,
                "collaboration_type",
                None,
            ),
            "status": str(collaboration.status),
        })

    return {
        "nodes": list(nodes.values()),
        "edges": edges,
        "total_researchers": len(nodes),
        "total_collaborations": len(edges),
    }

    # --------------------------------------------------------
    # Fetch researcher details
    # --------------------------------------------------------

    researchers = (
        db.query(Researcher)
        .filter(
            Researcher.id.in_(researcher_ids)
        )
        .all()
        if researcher_ids
        else []
    )

    researcher_map = {
        str(researcher.id): researcher
        for researcher in researchers
    }

    # --------------------------------------------------------
    # Build nodes
    # --------------------------------------------------------

    nodes = []

    for researcher in researchers:

        first_name = researcher.first_name or ""
        last_name = researcher.last_name or ""

        name = f"{first_name} {last_name}".strip()

        if not name:
            name = "Unknown Researcher"

        nodes.append(
            {
                "id": str(researcher.id),
                "name": name,
            }
        )

    # --------------------------------------------------------
    # Build links
    # --------------------------------------------------------

    links = []

    for collaboration in collaborations:

        source = str(
            collaboration.researcher1_id
        )

        target = str(
            collaboration.researcher2_id
        )

        links.append(
            {
                "source": source,
                "target": target,
                "collaboration_id": str(
                    collaboration.id
                ),
                "type": (
                    collaboration.collaboration_type.value
                    if hasattr(
                        collaboration.collaboration_type,
                        "value",
                    )
                    else str(
                        collaboration.collaboration_type
                    )
                ),
            }
        )

    # --------------------------------------------------------
    # Statistics
    # --------------------------------------------------------

    return {
        "nodes": nodes,
        "links": links,
        "statistics": {
            "researchers": len(nodes),
            "collaborations": len(links),
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
    current_user=Depends(get_current_user),
):

    collaborations = (
        db.query(Collaboration)
        .filter(
            Collaboration.status == CollaborationStatus.ACTIVE
        )
        .all()
    )

    if scope == "mine":

        current_researcher = (
            db.query(Researcher)
            .filter(
                Researcher.user_id == current_user.id
            )
            .first()
        )

        if current_researcher is None:
            raise HTTPException(
                status_code=404,
                detail="Researcher profile not found.",
            )

        collaborations = [
            collaboration
            for collaboration in collaborations
            if (
                collaboration.sender_id
                == current_researcher.id
                or
                collaboration.receiver_id
                == current_researcher.id
            )
        ]

    researcher_ids = set()

    for collaboration in collaborations:
        researcher_ids.add(
            collaboration.researcher1_id
        )
        researcher_ids.add(
            collaboration.researcher2_id
        )

    researchers = (
        db.query(Researcher)
        .filter(
            Researcher.id.in_(researcher_ids)
        )
        .all()
        if researcher_ids
        else []
    )

    researcher_map = {
        str(researcher.id): researcher
        for researcher in researchers
    }

    output = io.StringIO()

    writer = csv.writer(output)

    writer.writerow(
        [
            "Researcher 1",
            "Researcher 2",
            "Collaboration Type",
            "Status",
        ]
    )

    for collaboration in collaborations:

        researcher1 = researcher_map.get(
            str(collaboration.sender_id)
        )

        researcher2 = researcher_map.get(
            str(collaboration.receiver_id)
        )

        if not researcher1 or not researcher2:
            continue

        name1 = (
            f"{researcher1.first_name or ''} "
            f"{researcher1.last_name or ''}"
        ).strip()

        name2 = (
            f"{researcher2.first_name or ''} "
            f"{researcher2.last_name or ''}"
        ).strip()

        collaboration_type = (
            collaboration.collaboration_type.value
            if hasattr(
                collaboration.collaboration_type,
                "value",
            )
            else str(
                collaboration.collaboration_type
            )
        )

        status = (
            collaboration.status.value
            if hasattr(
                collaboration.status,
                "value",
            )
            else str(
                collaboration.status
            )
        )

        writer.writerow(
            [
                name1,
                name2,
                collaboration_type,
                status,
            ]
        )

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
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
    Return collaboration statistics for the entire system.

    Counts:
    - Accepted collaborations across all users
    - Pending collaboration requests across all users
    """

    total_collaborations = (
        db.query(Collaboration)
        .filter(
            Collaboration.status == CollaborationStatus.ACCEPTED
        )
        .count()
    )

    pending_collaborations = (
        db.query(Collaboration)
        .filter(
            Collaboration.status == CollaborationStatus.PENDING
        )
        .count()
    )

    return {
        "collaborations": total_collaborations,
        "pending_collaborations": pending_collaborations,
    }


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


