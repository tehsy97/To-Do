//Store place holder value
const title = document.getElementById("heading").placeholder;

$('#heading').focus(function() {
    $(this).css('font-size', '20px');
    $(this).attr('placeholder', 'Go to / Create List');
}).blur(function() { 
    $(this).css('font-size', '40px');
    $(this).attr('placeholder', title);
});

function submitForm(frm) {
    frm.submit();
}