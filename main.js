//TERCER DESAFÍO ENTREGABLE - Servidor con Express.
const fs = require('fs').promises

class Contenedor {
    constructor(file) {
        this.file = file
    }

    async save(title, price, thumbnail) {
        try {
        //Obtengo array con los objetos
          const objects = await this.getAll()
        //Obtengo Id del último objeto
          const lastId = objects.length > 0 ? objects[objects.length-1].id : 0
        //Creamos el ID al nuevo objeto en base al último.
          const newId = lastId + 1
        //Creamos el nuevo objeto con los parámetros recibidos
          const newObj = {
            id: newId,
            title,
            price,
            thumbnail
        }
        //Sumamos el nuevo objeto al array
          objects.push(newObj)
        //Lo guardamos en el archivo
          await this.saveObjects(objects)
        //Retornamos el nuevo ID creado
          return newId          

        } catch (error) {
            throw new Error("Error al guardar el objeto")
        }
    }

    async getById(id_obj) {
        try {
            //Obtenemos el array con los objetos
            const objects = await this.getAll()
            //Buscamos el objeto cuyo ID coincida con el ID recibido por parámetro.
            const foundById = objects.find((obj)=> obj.id === id_obj)
            return foundById || null

        } catch (error) {
            throw new Error("Error al obtener objeto por Id.")
        }
    }

    async getAll() {
        try {
            //Obtenemos la información del archivo pasado por parámetro al constructor
            const data = await fs.readFile(this.file, "utf-8")
            return data ? JSON.parse(data) : []

        } catch (error) {
            return []
        }
    }

    async deleteById(id_obj) {
        try {
            //Obtenemos el array con los objetos
            let objects = await this.getAll()
            //Modificamos el array original eliminando el objeto indicado por parámetro.
            objects = objects.filter((obj) => obj.id !== id_obj)
            //Actualizamos el array en el archivo
            await this.saveObjects(objects)

        } catch (error) {
            throw new Error("Error al eliminar el objeto.")
        }
    }

    async deleteAll() {
        try {
            //Vaciamos el archivo.
            await this.saveObjects([])
        } catch (error) {
            throw new Error("Error al eliminar los objetos.")
        }
    }

    async saveObjects(objects) {
        try {
            await fs.writeFile(this.file, JSON.stringify(objects, null, 2))
        } catch (error) {
            throw new Error("Error al guardar objetos.")
        }
    }

} 


//EJECUCIÓN
//Importando Express
const express = require('express')
const app = express()
const PORT = 8080
const products = new Contenedor("productos.txt")

//Agregar productos
app.post("/addProducts", async(req, res)=> {
    const productOne = await products.save("Producto A", 1000, "urlImage")
    const productTwo = await products.save("Producto B", 2000, "urlImage")
    const productThree = await products.save("Producto C", 3000, "urlImage")
    res.status(201).send({msg:`Productos agregados con ID ${productOne}, ${productTwo}, ${productThree}`})
})

//Obtener productos
app.get("/products", async (req, res) => {
    const data = await products.getAll()
    res.send(data)
})

//Obtener producto con Id random
app.get("/randomProduct", async (req, res) => {
    const data = await products.getAll()
    const max = data.length
    const min = 1
    const randomId = Math.floor(Math.random() * (max - min + 1) + min)
    const randomProduct = await products.getById(randomId)
    res.send(randomProduct) 
})

//Obtener producto por ID indicado
app.get("/products/:id", async (req, res) => {
    const productId = parseInt(req.params.id)
    const product = await products.getById(productId)

    if (product) {
        res.send(product) 
    } else {
        res.status(404).json({error: "Tarea no encontrada"})
    }
})

//Borrar productos
app.delete("/deleteProducts", async (req, res)=> {
    await products.deleteAll()
    res.json({msg: "Productos eliminados correctamente"})
})

//Borrar productos por ID
app.delete("/products/:id", async (req, res) =>{
    const productId = parseInt(req.params.id)
    await products.deleteById(productId)
    res.json({msg: `Producto con ID ${productId} eliminado correctamente.`})
})

const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
})
server.on("Error", error => console.log(error))

