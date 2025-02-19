import User from "../users/user.model.js";
import Post from "../posts/post.model.js";

export const savePost = async (req, res) => {
    try {
        const data = req.body;
        const user = await User.findById(req.usuario._id); 
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Usuario No Encontrado"
            });
        }

        const post = new Post({
            title: data.title,
            category: data.category,
            content: data.content,
            keeper: user._id,
            status: true
        });

        await post.save();

        res.status(200).json({
            success: true,
            message: "Publicacion Creada",
            post
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al guardar la Publicacion",
            error
        });
    }
}

export const getPosts = async(req, res) => {
    const {limite = 10, desde = 0} = req.query;
    const query = {status: true};
    try {
        const posts = await Post.find(query)
            .skip(Number(desde))
            .limit(Number(limite));
            
        const postsWithOwnerNames =  await Promise.all(posts.map(async (post) =>{
            const owner = await User.findById(post.keeper);
            return{
                ...post.toObject(),
                keeper: owner ? owner.nombre: "Creador No Encontrado"
            }
        }));
        
        const total = await Post.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            posts: postsWithOwnerNames
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error Al Obtener La Publicacion",
            error
        })
    }
}

export const searchPost = async (req, res) =>{
    const {id} = req.params;

    try {
        const post = await Post.findById(id);

        if(!post){
            return res.status(404).json({
                success: false,
                message: "Publicacion No Encontrada"
            })
        }

        const owner = await User.findById(post.keeper);

        res.status(200).json({
            success: true,
            post: {
                ...post.toObject(),
                keeper: owner ? owner.nombre : "Creador No Encontrado"
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error Al Buscar La Publicacion",
            error
        })
    }
}

export const deletePost = async(req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                msg: "Publicación No Encontrada"
            });
        }

        if (req.usuario.role === "USER_ROLE" && post.keeper.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                msg: "No autorizado para eliminar esta publicación" 
            });
        }

        post.status = false;
        await post.save();

        res.status(200).json({
            success: true,
            message: "Publicación Eliminada Exitosamente"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error Al Eliminar La Publicación",
            error
        });
    }
}

export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, keeper, ...data } = req.body; 

        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        const post = await Post.findById(id).populate("keeper");

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Publicacion No Encontrada"
            });
        }

        if (req.usuario.role === "USER_ROLE" && post.keeper._id.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                msg: "No autorizado para modificar esta publicación" 
            });
        }
              

        Object.assign(post, data);
        await post.save();

        res.status(200).json({
            success: true,
            msg: "Publicacion Actualizada!",
            post
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error Al Actualizar La Publicacion",
            error
        });
    }
}
