export const getDocumentTypes = (req, res) => {
    const documentTypes = [
        { value: 'transcript', label: 'Transcript' },
        { value: 'certificate', label: 'Certificate' },
        { value: 'letter', label: 'Letter' },
        { value: 'license', label: 'License' },
        { value: 'diploma', label: 'Diploma' },
        { value: 'permit', label: 'Permit' },
        { value: 'contract', label: 'Contract' },
        { value: 'invoice', label: 'Invoice' },
        { value: 'other', label: 'Other' }
    ];

    res.json({ documentTypes });
};
