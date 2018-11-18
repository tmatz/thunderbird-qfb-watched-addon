"use strict"

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

var installed = false;

function install(data, reason) {
    installed = true;
}

function uninstall(data, reason) {
}

function startup(data, reason) {
    Cu.import("chrome://qfb-watched/content/qfb-watched.js");
    if (installed) {
        qfb_watched.install();
    }
    qfb_watched.startup();
    forEachOpenWindow(loadIntoWindow);
    Services.wm.addListener(WindowListener);
}

function shutdown(data, reason) {
    if (reason == APP_SHUTDOWN) {
        return;
    }
    forEachOpenWindow(unloadFromWindow);
    Services.wm.removeListener(WindowListener);
    qfb_watched.shutdown();
    Cu.unload("chrome://qfb-watched/content/qfb-watched.js");
    Services.obs.notifyObservers(null, 'chrome-flush-caches', null);
}

function loadIntoWindow(window) {
    qfb_watched.loadIntoWindow(window);
}

function unloadFromWindow(window) {
    qfb_watched.unloadFromWindow(window);
}

function forEachOpenWindow(callback) {
    for (let window of Services.wm.getEnumerator('mail:3pane')) {
        callback(window);
    }
}

let WindowListener = {
    onOpenWindow: function (xulWindow) {
        var window = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindow);
        function onWindowLoaded() {
            window.removeEventListener("load", onWindowLoaded);
            if (window.document.documentElement.getAttribute('windowtype') == 'mail:3pane') {
                loadIntoWindow(window);
            }
        }
        window.addEventListener("load", onWindowLoaded);
    }
};