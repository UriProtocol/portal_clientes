const AuthSessionStatus = ({ status = null, className = '', ...props }) => {
    if (!status) {
        return null; // Si no hay status, no renderiza nada
    }

    return (
        <div
            className={`${className} font-medium text-sm text-green-600`}
            {...props}>
            {status}
        </div>
    );
};

export default AuthSessionStatus;
