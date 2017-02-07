var debugFunctions = (function() {
    var config: {
        customDebugging: false,
        debugId: false,
        setCustomDebugging: function() {
            return set_custom_debugging(this.debugId)
        }
    };
    console.log(config.setCustomDebugging);

    function debug_message(message) {
        (config.customDebugging && config.debugId) ? document.getElementById(config.debugId).innerHTML: console.log(message);
    }

    function set_custom_debugging(debugId) {
        config.debugId = this.config.debugId;
        config.customDebugging = true;
    }
})();
export {
    debugFunctions
};