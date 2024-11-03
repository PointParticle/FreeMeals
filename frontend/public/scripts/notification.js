// Fetch and display notifications
async function loadNotifications() {
    const response = await fetch('http://localhost:3000/notifications', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    const notifications = await response.json();
    const notificationContainer = document.querySelector("#notification-container");

    notifications.forEach(notification => {
        const notificationRow = `
            <tr>
                <td>${notification.message}</td>
                <td>${notification.notificationDate}</td>
            </tr>
        `;
        notificationContainer.innerHTML += notificationRow;
    });
}
