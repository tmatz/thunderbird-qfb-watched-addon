(function(){
    var { QuickFilterManager } = ChromeUtils.import("resource:///modules/QuickFilterManager.jsm"); 
    var { MailServices } = ChromeUtils.import("resource:///modules/MailServices.jsm"); 

    const nsMsgSearchOp = Ci.nsMsgSearchOp;
    const nsMsgSearchAttrib = Ci.nsMsgSearchAttrib;
    const filterService = MailServices.filters;
    const strings = Cc["@mozilla.org/intl/stringbundle;1"]
        .getService(Ci.nsIStringBundleService)
        .createBundle("chrome://qfb-watched/locale/qfb-watched.properties");

    let customTermWatchedThread = {
        name: strings.GetStringFromName('search_term_watched_threads.label'),
        id: 'qfb-watched@tmatz.github.io#term-watched',
        needsBody: false,
        getEnabled: function(scope, op) { return true; },
        getAvailable: function(scope, op) { return true; },
        getAvailableOperators: function(scope, length) {
            length.value = 2;
            return [nsMsgSearchOp.Is, nsMsgSearchOp.Isnt];
        },
        match: function(aMsgHdr, aSearchValue, aSearchOp) {
            let thread = aMsgHdr.folder.msgDatabase.GetThreadContainingMsgHdr(aMsgHdr);
            if (aSearchOp == nsMsgSearchOp.Is) {
                return thread && (thread.flags & 0x100);
            } else {
                return !thread || !(thread.flags & 0x100);
            }
        },
    };

    filterService.addCustomTerm(customTermWatchedThread);

    QuickFilterManager.defineFilter({
        name: "qf-watched",
        domId: "qfb-qf-watched",
        appendTerms: function(aTermCreator, aTerms, aFilterValue) {
            let term = aTermCreator.createTerm();
            let value = term.value;
            term.attrib = nsMsgSearchAttrib.Custom;
            value.attrib = term.attrib;
            term.value = value;
            term.customId = customTermWatchedThread.id;
            term.booleanAnd = true;
            term.op = nsMsgSearchOp.Is;
            aTerms.push(term);
        }
    });
})();
