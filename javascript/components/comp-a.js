export default function(text) {
    const el = document.createElement('p');
    el.textContent = text;
    document.body.appendChild(el);
}