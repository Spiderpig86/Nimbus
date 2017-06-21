const Toast = (text, shown) => (
    `
        <div class="toast ${shown}" id="toast">
            <p>${text}</p>
        </div>
    `
);
export default Toast