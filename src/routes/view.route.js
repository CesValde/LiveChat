import { Router } from "express";
const route = Router();

route.get('/socket', (req, res) => {
    res.render('chat',{})
})

export default route;