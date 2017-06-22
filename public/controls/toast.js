const Toast = (text, shown) => (
    `
        <div class="toast ${shown}" id="toast">
            <p class="text-center">${text}</p>
        </div>
    `
);
export default Toast