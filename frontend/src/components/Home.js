import React from 'react';
import Typography from '@mui/material/Typography';

function Home() {
    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Welcome to the Task Management App!
            </Typography>
            <Typography variant="body1" paragraph>
                This app allows you to collaboratively manage your tasks.
                You can create tasks, organize them into groups, and share them with others.
            </Typography>
            {/* Add more content or components as needed */}
        </div>
    );
}

export default Home;