let string="";
let buttons=document.querySelectorAll(".button");

Array.from(buttons).forEach((button)=>{
  button.addEventListener('click',(e)=>{
    buttonText=e.target.innerHTML;
    
    if(buttonText=="C"){
      string="";
      document.querySelector('input').value=string;
    }
    
    else if(buttonText=="DEL"){
      string=string.substring(0,string.length-1);
      document.querySelector('input').value=string;
    }
    
    else if(buttonText=="1/x"){
      string+=buttonText.substring(0,buttonText.length-1);
      document.querySelector('input').value=string;
    }
    
    else if(buttonText=="%"){
      string=string*1/100;
      document.querySelector('input').value=string;
    }
    
    else if(buttonText=="π"){
      string+=Math.PI.toFixed(3);
      document.querySelector('input').value=string;
    }

    else if(buttonText=="X"){
      buttonText="*";
      string+=buttonText;
      document.querySelector('input').value=string;
    }
    
    else if(buttonText=="e"){
      string+=Math.E.toFixed(3);
      document.querySelector('input').value=string;
    }

    else if(buttonText=="="){
      string=eval(string);
      if(!Number.isInteger(string)){
        string=string.toFixed(2)
      }
      document.querySelector('input').value=string;
    }

    else{
      console.log(e.target)
      string=string+buttonText;
      document.querySelector('input').value = string;
    }
  })
})