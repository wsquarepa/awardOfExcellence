const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});
admin.initializeApp();
var database = admin.database()

/**
* Here we're using Gmail to send 
*/
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'paauctionsite@gmail.com',
        pass: 'paAuctionSite1024-auction//>>JS'
    }
});

exports.auctionCheck = functions.https.onRequest((req, res) => {
    database.ref("/auctionItems").once('value').then(function(snapshot) {
        var values = snapshot.val()
        var keys = Object.keys(values)
        var now = new Date()
        for (var i = 0; i < keys.length; i++) {
            if (Date(values[keys[i]]["expires"]) <= now) {
                var value = values[keys[i]]
                sendMail(value["emailOfSeller"], "auction-ended", keys[i], value["currentBidder"], value["itemPrice"])
                database.ref("auctionItems/" + keys[i]).remove()
            }
        }
    })
});

exports.accountCreated = functions.https.onRequest((req, res) => {
    cors(req, res, function() {
        var dest = req.query.dest;
        var password = req.query.password
        mailOptions = {
            from: 'Pacific Academy Auction Site <paauctionsite@gmail.com>',
            to: dest,
            subject: "Thank you for creating an account!", // email subject
            html: `<head>
                        <style>
                            .passwordField {
                                background-color: #000000
                            }
                            
                            .passwordField:hover {
                                background-color: #ffffff
                            }
                        </style>
                    </head>
                    <body>
                            <h1>Thank you for creating an account!</h1>
                            The password to your account, ${dest}, is <div class="passwordField">${password}</div>
                    </body>` // email content in HTML
        };

        return transporter.sendMail(mailOptions, (erro, info) => {
            if(erro){
                return res.send(erro.toString());
            }
            return res.send('<script>javascript:history.go(-1)</script>');
        });
    })
})

exports.functionsTest = functions.https.onRequest((req, res) => {
    cors(req, res, function() {
        res.send("<h1>Error 200 not forbidden :0</h1>")
    })
})

function sendMail(dest, type, itemName, winner, finalBid) {
    var mailOptions = {}
    if (type == "auction-ended") {
        mailOptions = {
            from: 'Pacific Academy Auction Site <paauctionsite@gmail.com>',
            to: dest,
            subject: "Your auction ended", // email subject
            html: `<h1> Your aucitoned item ended. </h1> 
            <p style="font-size:14">Your auction item, ${itemName}, had expired on the store. <br>
            The winner of the auciton is ${winner} and he/she is willing to pay ${finalBid} for your item.</p>` // email content in HTML
        };
    } else if (type == "item-created") {
        mailOptions = {
            from: 'Pacific Academy Auction Site <paauctionsite@gmail.com>',
            to: dest,
            subject: "You created an item!", // email subject
            html: `<h1> You have created an item!. </h1> 
            <p style="font-size:14">Your auction item, ${itemName}, has been created and is on the store. <br>
            Thank you for creating an item, ${dest}!</p>` // email content in HTML
        };
    }

    
    // returning result
    return transporter.sendMail(mailOptions, (erro, info) => {
        if(erro){
            return res.send(erro.toString());
        }
        return res.send('<script>javascript:history.go(-1)</script>');
    });
}

