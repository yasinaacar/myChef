module.exports=function(req, res){
    return res.status(404).render("error/404",{
        title: "404 Not Found"
    });
}