module.exports=function(codeHead){
    const date=Date.now()/10000000;
    return `${codeHead}${date}${Math.floor(Math.random()*101)}`;

}