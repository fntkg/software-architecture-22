const Message = require('./messageModel');
const mongoose = require("mongoose");
const User = require("../users/userModel");

exports.getMessages = (req, res) => {
    if (req.user !== req.params.username) return res.sendStatus(403)
    Message.find({username: req.user}, '_id user date content shared likes numOfComments').
        populate('user', 'username name avatar').
        exec(function (err, messages){
            if (err) return res.sendStatus(400)
        res.status(200).send(messages)
    })
}

exports.create = (req, res) => {
    if (req.user !== req.params.username) return res.sendStatus(403)
    User.findOne({username: req.user}).
        exec(function (err){
            if (err) return res.sendStatus(400)
        User.findOne({username: req.user}, 'id').exec(function (err, user){
            Message.create({
                _id: new mongoose.Types.ObjectId(),
                user: user.id,
                original_message: req.body.id_comment,
                content: req.body.content,
            }, function (err, message){
                if (err) return res.sendStatus(400)
                res.status(201).send({id: message.id})
            })
        })
    })
}

exports.findOne = (req, res) => {
    if (req.user !== req.params.username) return res.sendStatus(403)
    Message.findOne({_id: req.params.id}, ).populate('user', 'username name avatar')
        .populate({path: 'original_message', populate: {path: 'user'}})
        .populate({path: 'comments', populate: {path: 'user'}}).exec(function (err, message){
        if (err) return res.sendStatus(400)
        console.log('Retrieved message: ' + message)
        return res.status(200).send(message)
    })
}

exports.update = (req, res) => {
    if (req.user !== req.params.username) return res.sendStatus(403)
    Message.findOneAndUpdate(
        {_id: req.params.id},
        {$inc: {'likes' : +req.body.like, 'shared' : +req.body.shared}},
        {new: true}
    ).exec(function (err, message){
        if (err) return res.sendStatus(400)
        return res.status(200).send(message)
    })
}

exports.delete = (req, res) => {
    if (req.user !== req.params.username) return res.sendStatus(403)
    Message.findOneAndRemove({_id: req.params.id}, function (err, user) {
        if (err) return res.sendStatus(400)
        if (!user) return res.sendStatus(404)
        return res.sendStatus(204)
    })
}
