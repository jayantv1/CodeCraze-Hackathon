import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-white/5 backdrop-blur-lg rounded-xl shadow-lg border border-white/10 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
