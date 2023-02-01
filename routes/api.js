'use strict';

const issueModel = require("../models/issueModel.js")

const requiredFields = (propertyOfReq, fields) => {
  return (req, res, next) => {
    const obj = req[propertyOfReq]


    const everyRequired = fields.every((field_name) => {
      return obj[field_name] !== undefined
    })

    if (everyRequired)
      next()
    else
      res.send({ error: "required field(s) missing" })
  }
}

const populateFromModel = (obj) => {
  let query = {}
  let modelFields = {...issueModel.schema.obj}
  modelFields._id = {}

  Object.keys(modelFields).forEach(field => {
    if (obj[field])
      query[field] = obj[field]
  })

  return query
}

module.exports = function (app) {
  app.route('/api/issues/:project')

    .get(async function (req, res) {
      const { project } = req.params;

      let query = populateFromModel(req.query)
      query.project_name = project

      try {
        const result = await issueModel.find(query).select("-__v -project_name")
        res.send(result)
      } catch {
        res.send({ error: "an error ocurred" })
      }
    })

    .post(requiredFields("body", ["issue_title", "issue_text", "created_by"]), async function (req, res) {
      const { project } = req.params;

      let postQuery = populateFromModel(req.body)
      postQuery.project_name = project
      postQuery.assigned_to = postQuery.assigned_to || ""
      postQuery.status_text = postQuery.status_text || ""

      let newIssue = new issueModel(postQuery)

      try {
        newIssue = await newIssue.save()

        newIssue = newIssue.toObject()
        delete newIssue.__v
        delete newIssue.project_name


        res.send(newIssue)
      } catch {
        res.status(502).send()
      }
    })

    .put(async function (req, res) {
      const { project } = req.params;
      const { _id } = req.body
      let updateQuery = populateFromModel(req.body)
      updateQuery.updated_on = new Date().toISOString()

      if (!_id)
        return res.send({ error: "missing _id" })

      if (Object.keys(updateQuery).length < 1)
        return res.send({ error: "no update field(s) sent", "_id": _id })

      try {
        delete updateQuery._id
        if (!await issueModel.findByIdAndUpdate(_id, updateQuery))
          throw new Error()

        res.send({ result: "successfully updated", "_id": _id })
      } catch {
        return res.send({ error: 'could not update', '_id': _id })
      }

    })

    .delete(async function (req, res) {
      const { project } = req.params;
      const { _id } = req.body

      if (!_id)
        return res.send({ error: "missing _id" })

      try {
        if (!await issueModel.findByIdAndDelete(_id))
          throw new Error()
        res.send({ result: 'successfully deleted', '_id': _id })
      } catch {
        res.send({ error: "could not delete", "_id": _id })
      }
    });

};
