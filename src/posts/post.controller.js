import User from "../users/user.model.js";
import Post from "../posts/post.model.js";
import Category from "../categories/category.model.js";

export const savePost = async (req, res) => {
    try {
        const { title, category, content } = req.body;
        const user = await User.findById(req.usuario._id); 

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Usuario No Encontrado"
            });
        }

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: "Categoría no válida"
            });
        }

        const post = new Post({
            title,
            category,
            content,
            keeper: user._id,
            status: true
        });

        await post.save();

        res.status(200).json({
            success: true,
            message: "Publicación Creada",
            post
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al guardar la Publicación",
            error
        });
    }
};

export const getPosts = async(req, res) => {
    const { limite = 10, desde = 0 } = req.query;
    const query = { status: true };
    
    try {
        const posts = await Post.find(query)
            .populate("keeper", "nombre")
            .populate("category", "name")
            .skip(Number(desde))
            .limit(Number(limite));

        const total = await Post.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            posts
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener las publicaciones",
            error
        });
    }
};

export const searchPost = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.findById(id)
            .populate("keeper", "nombre")
            .populate("category", "name");

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Publicación No Encontrada"
            });
        }

        res.status(200).json({
            success: true,
            post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al buscar la publicación",
            error
        });
    }
};

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
            message: "Error al eliminar la publicación",
            error
        });
    }
};

export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, ...data } = req.body;

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
                message: "Publicación No Encontrada"
            });
        }

        if (req.usuario.role === "USER_ROLE" && post.keeper._id.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                msg: "No autorizado para modificar esta publicación" 
            });
        }

        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: "Categoría no válida"
                });
            }
            post.category = category;
        }

        Object.assign(post, data);
        await post.save();

        res.status(200).json({
            success: true,
            msg: "Publicación Actualizada!",
            post
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error al actualizar la publicación",
            error
        });
    }
};
