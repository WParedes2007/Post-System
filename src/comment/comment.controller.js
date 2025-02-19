import User from "../users/user.model.js";
import Post from "../posts/post.model.js";
import Comment from "../comment/comment.model.js";

export const saveComment = async (req, res) => {
    try {
        const data = req.body;
        const user = await User.findById(req.usuario._id); 
        const post = await Post.findById(data.postId);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Usuario No Encontrado"
            });
        }

        if (!post) {
            return res.status(400).json({
                success: false,
                message: "Publicacion No Encontrada"
            });
        }

        const comment = new Comment({
            content: data.content,
            keeperUser: user._id,
            keeperPost: post._id,
            status: true
        });

        await comment.save();

        res.status(200).json({
            success: true,
            message: "Comentario Creado",
            comment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al guardar el comentario",
            error
        });
    }
}

export const getComments = async(req, res) => {
    const {limite = 10, desde = 0} = req.query;
    const query = {status: true};
    try {
        const comments = await Comment.find(query)
            .skip(Number(desde))
            .limit(Number(limite));
            
        const commentsWithOwnerNames =  await Promise.all(comments.map(async (comment) =>{
            const owner = await User.findById(comment.keeperUser);
            const post = await Post.findById(comment.keeperPost)
            return{
                ...comment.toObject(),
                keeperUser: owner ? owner.nombre: "Usuario No Encontrado",
                keeperPost: post ? post.title: "Publicacion No Encontrada"
            }
        }));
        
        const total = await Comment.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            comments: commentsWithOwnerNames
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error Al Obtener El Comentario",
            error
        })
    }
}

export const searchComment = async (req, res) =>{
    const {id} = req.params;

    try {
        const comment = await Comment.findById(id);

        if(!comment){
            return res.status(404).json({
                success: false,
                message: "Comentario No Encontrado"
            })
        }

        const owner = await User.findById(comment.keeperUser);

        res.status(200).json({
            success: true,
            comment: {
                ...comment.toObject(),
                keeperUser: owner ? owner.name : "Creador No Encontrado"
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error Al Buscar El Comentario",
            error
        })
    }
}

export const deleteComment = async(req, res) => {
    const {id} = req.params;
    try {

        const comment = await Comment.findByIdAndUpdate(id, { status: false });        

        if (req.usuario.role === "USER_ROLE" && comment.keeperUser.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                msg: "No autorizado para modificar este comentario" 
            });
        }
        
        if (!comment) {
            return res.status(404).json({
                 success: false, 
                 msg: "Comentario No Encontrado" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Comentario Eliminado Exitosamente"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error Al Eliminar El Comentario",
            error
        })
    }

}

export const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, keeper, ...data } = req.body; 

        const comment = await Comment.findByIdAndUpdate(id, data, { new: true });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comentario No Encontrado"
            });
        }

        if (req.usuario.role === "USER_ROLE" && comment.keeperUser.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                msg: "No autorizado para modificar este comentario" 
            });
        }

        res.status(200).json({
            success: true,
            msg: "Comentario Actualizado!",
            comment
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error Al Actualizar El Comentario",
            error
        });
    }
}