import React, { useState } from 'react';

export default function FileUpload({handleDownloadCSV}) {
    return (
        <div>
            <button type="button" onClick={handleDownloadCSV}>
                Download CSV
            </button>
        </div>
    )
}