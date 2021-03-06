// ==UserScript==
// @name            Spamcop tweaks
// @namespace       http://wikberg.fi/userscript/spamcop
// @version         0.6
// @description     Add functionality to Spamcop reporting page
// @author          Michael Wikberg
// @include         /^https://www.spamcop.net/(sc(\?id.*)?)?$/
// @grant           unsafeWindow
// @copyright       2016 Michael Wikberg \u003Cscripts@wikberg.fi>
// @license         GPLv3
// @updateURL       https://github.com/milkboy/userscripts/raw/master/spamcop-tweaks.js
// ==/UserScript==

// Add jQuery
var GM_JQ = document.createElement('script');
GM_JQ.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js';
GM_JQ.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(GM_JQ);

// Check if jQuery's loaded
function GM_wait() {
    if(typeof unsafeWindow.jQuery == 'undefined')
{ window.setTimeout(GM_wait,100); }
        else { $ = unsafeWindow.jQuery; run(); }
}
GM_wait();

var JQueryScript = document.createElement("script");
JQueryScript.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js");
JQueryScript.setAttribute("type", "text/javascript");
document.body.appendChild(JQueryScript);

function run() {
    var url = '' + window.location;
    if(url.match(/^https:\/\/www\.spamcop\.net\/sc\?id.*$/)) {
        runSend();
    }
    else {
        runAutoadvance();
    }
}

function runAutoadvance() {
    $("a").each(function() {
        if($(this).attr('href').match(/sc\?id=.*/)) {
            $(this).click(function(e) {
                e.preventDefault();
            });
            $(this).css('color', 'red');
            $(this).text('Loading');
            window.location.href = $(this).attr('href');
        }
    });
}

function runSend () {
    'use strict';

    var $ = jQuery;
    var nosendto, nosendtosrc, nosendtoisrc, nosendtoweb, nosendtoiweb, nosendtointermediary, source;
    var runningNumberRe = /[a-z]*(\d+)/;

    //we have some data?
    if(typeof localStorage.getItem('nosendtosrc') === 'undefined' || localStorage.getItem('nosendtosrc') === null) {
        nosendtosrc = [];
    } else {
        nosendtosrc = JSON.parse(localStorage.getItem('nosendtosrc'));
    }
    if(typeof localStorage.getItem('nosendtoisrc') === 'undefined' || localStorage.getItem('nosendtoisrc') === null) {
        nosendtoisrc = [];
    } else {
        nosendtoisrc = JSON.parse(localStorage.getItem('nosendtoisrc'));
    }
    if(typeof localStorage.getItem('nosendtoweb') === 'undefined' || localStorage.getItem('nosendtoweb') === null) {
        nosendtoweb = [];
    } else {
        nosendtoweb = JSON.parse(localStorage.getItem('nosendtoweb'));
    }
    if(typeof localStorage.getItem('nosendtoiweb') === 'undefined' || localStorage.getItem('nosendtoiweb') === null) {
        nosendtoiweb = [];
    } else {
        nosendtoiweb = JSON.parse(localStorage.getItem('nosendtoiweb'));
    }

    if(typeof localStorage.getItem('nosendtointermediary') === 'undefined' || localStorage.getItem('nosendtointermediary') === null) {
        nosendtointermediary = [];
    } else {
        nosendtointermediary = JSON.parse(localStorage.getItem('nosendtointermediary'));
    }

    console.log("Don't send to sources: " + JSON.stringify(nosendtosrc));
    console.log("Don't send to third party source: " + JSON.stringify(nosendtoisrc));
    console.log("Don't send to www: " + JSON.stringify(nosendtoweb));
    console.log("Don't send to third party web: " + JSON.stringify(nosendtoisrc));
    console.log("Don't send to intermediary parties: " + JSON.stringify(nosendtointermediary));

    $("input[name^='master']").each(function(index) {
        source = $("[name^='type']", $(this).parent()).val();
        console.log('Found email address for ' + source + ': ' + $(this).val());

        nosendto = getList(source);

        if($.inArray($(this).val(), nosendto) >= 0) {
            if($("input[name^='master']").length <= 1 && source == 'source') {
                //Only 0-1 recipient(s). don't uncheck
                console.log("Less than 2 recipients, not unchecking " + $(this).val());
            } else {
                //Uncheck
                var num = $(this).attr("name").match(runningNumberRe)[1];
                console.log($(this).attr("name"));
                console.log("Not sending to " + $(this).val());
                $("[name='send" + num + "']", $(this).parent()).prop('checked', false);
            }
        }
    });

    $("[name^='send'] [type='checkbox']").change(function(asd) {
        var num = $(this).attr("name").match(runningNumberRe)[1];
        source = $("[name='type" + num + "']").val();
        nosendto = getList(source);

        console.log(source + ": " + $("[name='master" + num + "']").val() + " changed. ");

        if($(this).prop('checked')) {
            doSendTo(source, nosendto, $("[name='master" + num + "']").val());
        } else {
            dontSendTo(source, nosendto, $("[name='master" + num + "']").val());
        }
    });

    function getList(source) {
        console.log("Getting list for " + source);
        switch(source) {
            case 'i-source':
                return nosendtoisrc;
            case 'source':
                return nosendtosrc;
            case 'www':
                return nosendtoweb;
            case 'i-www':
                return nosendtoiweb;
            case 'intermediary':
                return nosendtointermediary;
            default:
                alert("Unknown type: " + source);
                return [];
        }
    }

    function doSendTo(source, nosendto, address) {
        var pos = nosendto.indexOf(address);
        console.log(source + ": Will be sending alerts to " + address);
        if(pos >= 0) {
            nosendto.splice(pos, 1);
        }
        save(source, nosendto);
    }

    function dontSendTo(source, nosendto, address) {
        var pos = nosendto.indexOf(address);
        console.log(source + ": Will not be sending alerts to " + address);
        if(pos == -1) {
            nosendto.push(address);
        }
        save(source, nosendto);
    }

    function save(source, nosendto) {
        console.log("Saving " + source + " data");
        switch(source) {
            case 'source':
                localStorage.setItem('nosendtosrc', JSON.stringify(nosendto));
                break;
            case 'i-source':
                localStorage.setItem('nosendtoisrc', JSON.stringify(nosendto));
                break;
            case 'www':
                localStorage.setItem('nosendtoweb', JSON.stringify(nosendto));
                break;
            case 'i-www':
                localStorage.setItem('nosendtoiweb', JSON.stringify(nosendto));
                break;
            case 'intermediary':
                localStorage.setItem('nosendtointermediary', JSON.stringify(nosendto));
                break;
        }
    }
}
