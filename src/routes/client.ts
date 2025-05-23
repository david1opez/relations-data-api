import { Router } from "express"
import ClientHandler from "../handlers/client"

const router = Router()
const clientHandler = new ClientHandler()

router.get("/clients", clientHandler.getAll.bind(clientHandler))
router.post("/clients", clientHandler.create.bind(clientHandler))
router.delete("/clients/:email", clientHandler.remove.bind(clientHandler))

export default router
