import React from 'react';
import Typography from '@mui/material/Typography';
import Navbar from './Navbar';
import image from './../assets/icon.ico'
import { Grid } from '@mui/material';

function Home() {

    const creators = [
        { name: 'GURSIMRAN', rollno: '23251097' },
        { name: 'NITISH', rollno: '67890' },
        { name: 'TANMAY', rollno: '67890' },
        { name: 'EASHAN', rollno: '67890' },
        { name: 'SHARANYA', rollno: '67890' },
        // Add more creators as needed
    ];

    return (
        <>
            <Navbar />
            <div>
                <Typography variant="h4" gutterBottom>
                    Welcome to the SyncEdge
                </Typography>
                <Typography variant="body1" paragraph>
                    Organize the chaos, one task at a time.
                </Typography>
                <img src={image} alt="SyncEdge Logo" style={{ width: '100px', height: 'auto' }} />

                {/* <Typography variant="h6" gutterBottom>
                    Created by:
                </Typography>
                <Grid container spacing={2}>
                    {creators.map((creator) => (
                        <Grid item key={creator.rollno} xs={12} sm={6} md={4}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ marginLeft: '10px' }}>
                                    <Typography variant="subtitle1">{creator.name}</Typography>
                                    <Typography variant="subtitle2" color="textSecondary">{creator.rollno}</Typography>
                                </div>
                            </div>
                        </Grid>
                    ))}
                </Grid> */}

            </div>
        </>
    );
}

export default Home;