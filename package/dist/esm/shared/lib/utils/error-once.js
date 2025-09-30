let errorOnce = (_)=>{};
if (process.env.NODE_ENV !== 'production') {
    const errors = new Set();
    errorOnce = (msg)=>{
        if (!errors.has(msg)) {
            console.error(msg);
        }
        errors.add(msg);
    };
}
export { errorOnce };

//# sourceMappingURL=error-once.js.map