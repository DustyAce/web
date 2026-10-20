let tipBox = document.getElementById("randomTipText");
let tipTitle = document.getElementById("randomTipTitle");


let daysTillSesh =  Math.floor(Math.floor((new Date('01/05/2027') - new Date()))/(1000*60*60*24));

tips = [
        "I use EndeavourOS btw",
        "don't forget to clear your cache!",
        "drink some water. Please.",
        "use git! and don't forget to make frequent commits",
        "stand up and stretch",
        "₍^. .^₎Ⳋ <- look at this cat!",
        "There are " + daysTillSesh + " days left until the session.",
        "get enough sleep today. (4 hours is NOT enough!)",
        ":(){:|:&};:",
        "add your public SSH key to Helios, github and gitlab, make your life easier"
];

randomTipTitle.innerText = "$ echo tip$(($RANDOM % "+ tips.length +")).txt "

tipBox.innerText = tips[Math.floor(tips.length*Math.random())];


