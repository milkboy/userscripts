// ==UserScript==
// @name         Spamcop tweaks
// @namespace    http://wikberg.fi/userscript/spamcop
// @version      0.1
// @description  Add functionality to Spamcop reporting page
// @author       Michael Wikberg
// @include      /^https://www.spamcop.net/sc\?id.*/
// @grant        unsafeWindow
// @copyright			2016 Michael Wikberg \u003Cscripts@wikberg.fi>
// @license				GPLv3
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


function run () {
    'use strict';

    var $ = jQuery;
    var loop = 0;

    var nosendto, nosendtosrc, nosendtoweb, source;

    //we have some data?
    if(typeof localStorage.getItem('nosendtosrc') === 'undefined' || localStorage.getItem('nosendtosrc') === null) {
        nosendtosrc = [];
    } else {
        nosendtosrc = JSON.parse(localStorage.getItem('nosendtosrc'));
    }
    if(typeof localStorage.getItem('nosendtoweb') === 'undefined' || localStorage.getItem('nosendtoweb') === null) {
        nosendtoweb = [];
    } else {
        nosendtoweb = JSON.parse(localStorage.getItem('nosendtoweb'));
    }

    console.log("Don't send to sources: " + JSON.stringify(nosendtosrc));
    console.log("Don't send to www: " + JSON.stringify(nosendtoweb));

    //FIXME: use hidden field instead in selector to get the addresses directly
    $("[name='sendreport'] > p > a").each(function(index) {
        if(/^mailto:.*/.test($(this).attr("href"))) {
            ++loop;
            console.log('Found email address: ' + $(this).text() + ' at index ' + loop);
            source = $("[name='type" + loop + "']").val();

            console.log("Source is: " + source);
            switch(source) {
                case 'source':
                    nosendto = nosendtosrc;
                    break;
                case 'www':
                    nosendto = nosendtoweb;
                    break;
                default:
                    alert("Unknown type: " + $("[name='type" + loop + "']").val());
            }

            if($.inArray($(this).text(), nosendto) >= 0) {
                //Uncheck
                console.log("Not sending to " + $(this).text());
                $("[name='send" + loop + "']").prop('checked', false);
            }


            $("[name='send" + loop + "']").change(loop, function(asd) {

                source = $("[name='type" + asd.data + "']").val();
                switch(source) {
                    case 'source':
                        nosendto = nosendtosrc;
                        break;
                    case 'www':
                        nosendto = nosendtoweb;
                        break;
                }

                console.log(source + ": " + $("[name='master"+asd.data+"']").val() + " changed. ");
                //console.log($(this));
                var pos = nosendto.indexOf($("[name='master"+asd.data+"']").val());
                if($(this).prop('checked')) {
                    console.log(source + ": Will be sending alerts");
                    if(pos >= 0) {
                        nosendto.splice(pos, 1);
                    }
                } else {
                    console.log(source + ": Will not be sending alerts");
                    if(pos == -1) {
                        nosendto.push($("[name='master"+asd.data+"']").val());
                    }
                }
                switch(source) {
                    case 'source':
                        localStorage.setItem('nosendtosrc', JSON.stringify(nosendto));
                        break;
                    case 'www':
                        localStorage.setItem('nosendtoweb', JSON.stringify(nosendto));
                        break;
                }
            });
        }
    });

}
