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
    console.log("Opening database...")
    admin.database().ref("/auctionItems").once('value', function(snapshot) {
        console.log("Starting 'for' loop.")
        var values = snapshot.val() || "No value"
        if (values != "No value") {
            var keys = Object.keys(values)
            var now = new Date().getTime()
            for (var i = 0; i < keys.length; i++) {
                console.log("Loop time: " + i)
                var endTime = new Date(parseInt(values[keys[i]]["expires"])).getTime()
                console.log(endTime)
                console.log(now)
                if (now > endTime) {
                    console.log("It's email time!")
                    var value = values[keys[i]]
                    //sendMail(value["emailOfSeller"], "auction-ended", keys[i], value["currentBidder"], value["itemPrice"])
                    if (value["currentBidder"] != "") {
                        var mailOptions = {}
                        mailOptions = {
                            from: 'Pacific Academy Auction Site <paauctionsite@gmail.com>',
                            to: value["emailOfSeller"],
                            subject: "Your auction ended", // email subject
                            html: `<h1> Your aucitoned item ended. </h1> 
                            <p style="font-size:14">Your auction item, ${keys[i]}, had expired on the store. <br>
                            The winner of the auciton is <a href='mailto:${value["currentBidder"]}'>${value["currentBidder"]}</a> and he/she is willing to pay
                            $${value["itemPrice"]} for your item.</p>` // email content in HTML
                        };

                        var mailOptions2 = {}
                        mailOptions2 = {
                            from: 'Pacific Academy Auction Site <paauctionsite@gmail.com>',
                            to: value["currentBidder"],
                            subject: "You won an auction!", // email subject
                            html: `<h1> You've won an item! </h1> 
                            <p style="font-size:14">The auction item, ${keys[i]}, had expired on the store. <br>
                            You have won the item and the final price is $${value["itemPrice"]} for the item. <br>
                            Please get in contact with <a href='mailto:${value["emailOfSeller"]}'>${value["emailOfSeller"]}</a> soon to arrange the item transfer!</p>` // email content in HTML
                        }

                        transporter.sendMail(mailOptions)
                        transporter.sendMail(mailOptions2)
                        
                    } else {
                        var mailOptions = {}
                        mailOptions = {
                            from: 'Pacific Academy Auction Site <paauctionsite@gmail.com>',
                            to: value["emailOfSeller"],
                            subject: "Your auction ended", // email subject
                            html: `<h1> Your aucitoned item ended. </h1> 
                            <p style="font-size:14">Your auction item, ${keys[i]}, had expired on the store. <br>
                            Unfortunatley, nobody wanted your item. Try pricing it lower, or make a new one!</p>` // email content in HTML
                        };

                        transporter.sendMail(mailOptions)
                    }
                    database.ref("auctionItems/" + keys[i]).remove()
                }
                console.log("Loop " + i + " complete, starting next loop.")
            }
            console.log("Successful looping.")
            res.status(200).send("Execution complete.")
        } else {
            res.status(200).send("No execution to do.")
        }
        
    })
});

exports.accountCreated = functions.https.onRequest((req, res) => {
    cors(req, res, function() {
        var dest = req.query.dest;
        mailOptions = {
            from: 'Pacific Academy Auction Site <paauctionsite@gmail.com>',
            to: dest,
            subject: "Thank you for creating an account!", // email subject
            html: `<head>
                        <style>
                            body {
                                font-size: 14px;
                            }
                        </style>
                    </head>
                    <body>
                            <h1>Welcome to the Pacific academy Auction site!</h1>
                            Thank you for creating an account, ${dest}! I hope you have fun selling items!
                            -William
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

