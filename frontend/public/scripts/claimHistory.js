// claim-history.js

// Fetch and display claim history
async function loadClaimHistory() {
    const response = await fetch('http://localhost:3000/claims/history', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    const claims = await response.json();
    const claimContainer = document.querySelector("#claim-history-container");

    claims.forEach(claim => {
        const claimRow = `
            <tr>
                <td>${claim.productName}</td>
                <td>${claim.receiverName}</td>
                <td>${claim.quantity} ${claim.metrics}</td>
                <td>${claim.claimDate}</td>
            </tr>
        `;
        claimContainer.innerHTML += claimRow;
    });
}
