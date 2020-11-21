function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function amount(field) {
    console.log(field.value)
    //var field = document.getElementById("PayeeModal");
    var regex = new RegExp("^[0-9]+(\.[0-9]{1,2})?$"); 
    //decimalna števila z največj 2ma decimalnima mestoma ločilo je pika!
    //črkev male,velike,številke ne veljajo števila kot so .73, 
    if(!field.value.match(regex)) {
      field.style.borderColor = "red";
      document.getElementById("amm").innerHTML ='<div class="tekst" style="color:red">Input may only contain decimal numbers separated by \'.\' with max 2 decimal places.</div>';
      return 0;
    }
    else {
      field.style.borderColor = "#ced4da";
      document.getElementById("amm").innerHTML = "";
      return 1;
    }
}
function amount3(field,id) {
    //var field = document.getElementById("PayeeModal");
    var regex = new RegExp("^[0-9]+(\.[0-9]{1,2})?$"); 
    //decimalna števila z največj 2ma decimalnima mestoma ločilo je pika!
    //črkev male,velike,številke ne veljajo števila kot so .73, 
    if(!field.value.match(regex)) {
      field.style.borderColor = "red";
      document.getElementById("vnos"+id).innerHTML ='<div class="tekst" style="color:red">Input may only contain decimal numbers separated by \'.\' with max 2 decimal places.</div>';
      return 0;
    }
    else {
      field.style.borderColor = "#ced4da";
      document.getElementById("vnos"+id).innerHTML = "";
      return 1;
    }
}