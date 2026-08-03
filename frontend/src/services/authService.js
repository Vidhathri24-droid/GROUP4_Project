// Direct Login Mode (Without Backend Authentication Dependency)

export const login = async(email, password) => {
    // Simple validation to ensure fields aren't empty
    if (!email || !password) {
        throw new Error('Please enter email and password.');
    }

    // Create a mock token for frontend state/localStorage
    const mockToken = "mock_jwt_token_123456789";
    localStorage.setItem('token', mockToken);

    return {
        access_token: mockToken,
        token_type: "bearer",
        user: {
            email: email,
            name: "User"
        }
    };
};

export const register = async(userData) => {
    return {
        message: "User registered successfully!"
    };
};