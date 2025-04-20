// popup.js
function showPopup(type, message) {
    // Remove any existing popup
    const existing = document.getElementById('popupOverlay');
    if (existing) existing.remove();
  
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'popupOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';
  
    // Create popup card
    const popup = document.createElement('div');
    popup.style.background = 'rgba(255, 255, 255, 0.9)';
    popup.style.backdropFilter = 'blur(10px)';
    popup.style.padding = '30px 20px';
    popup.style.borderRadius = '12px';
    popup.style.textAlign = 'center';
    popup.style.maxWidth = '90%';
    popup.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
    popup.style.animation = 'fadeInPopup 0.3s ease';
  
    // Message text
    const msg = document.createElement('p');
    msg.textContent = message;
    msg.style.marginBottom = '20px';
    msg.style.fontSize = '1.2rem';
    msg.style.color = type === 'error' ? '#ff3333' : '#0CC7F6';
  
    // OK Button
    const btn = document.createElement('button');
    btn.textContent = 'OK';
    btn.style.backgroundColor = type === 'error' ? '#ff3333' : '#0CC7F6';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.padding = '10px 20px';
    btn.style.borderRadius = '8px';
    btn.style.cursor = 'pointer';
    btn.style.fontWeight = 'bold';
    btn.style.transition = 'background 0.3s';
    btn.onclick = () => document.getElementById('popupOverlay').remove();
  
    // Hover effect
    btn.onmouseover = () => btn.style.backgroundColor = type === 'error' ? '#cc0000' : '#0aa6d1';
    btn.onmouseout = () => btn.style.backgroundColor = type === 'error' ? '#ff3333' : '#0CC7F6';
  
    // Assemble popup
    popup.appendChild(msg);
    popup.appendChild(btn);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  }
  
  // Add Fade In Animation
  const style = document.createElement('style');
  style.textContent = `
  @keyframes fadeInPopup {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }`;
  document.head.appendChild(style);
  