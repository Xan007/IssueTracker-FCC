const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const issueTemplate = {
    issue_title: "Fix error",
    issue_text: "When we post.",
    created_by: "Joe",
    assigned_to: "Joe",
    status_text: "QA"
}

let issueId = "63d8aa8242570e783effbb7e";

suite('Functional Tests', function () {
    suite("Post requests", function () {
        test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
            chai
                .request(server)
                .post("/api/issues/test")
                .send(issueTemplate)
                .end((err, res) => {
                    assert.equal(res.status, 200)

                    assert.property(res.body, 'created_on')
                    assert.property(res.body, 'updated_on')
                    assert.property(res.body, '_id')

                    issueId = res.body._id

                    done()
                })

        });

        test("Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {
            let issueOnlyRequired = {
                ...issueTemplate
            }
            delete issueOnlyRequired.assigned_to
            delete issueOnlyRequired.status_text

            chai
                .request(server)
                .post("/api/issues/test")
                .send(issueOnlyRequired)
                .end((err, res) => {
                    assert.equal(res.status, 200)

                    assert.property(res.body, 'created_on')
                    assert.property(res.body, 'updated_on')
                    assert.property(res.body, '_id')

                    done()
                })
        });

        test("Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
            let issueMissingRequired = {
                ...issueTemplate
            }
            delete issueMissingRequired.assigned_to
            delete issueMissingRequired.status_text
            delete issueMissingRequired.created_by

            chai
                .request(server)
                .post("/api/issues/test")
                .send(issueMissingRequired)
                .end((err, res) => {
                    assert.equal(res.status, 200)
                    assert.deepEqual(res.body, { error: "required field(s) missing" })
                    done()
                })
        });
    })

    suite("Put requests", function () {
        test("Update one field on an issue: PUT request to /api/issues/{project}", function (done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: issueId,
                    status_text: 'Updating'
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200)
                    assert.deepEqual(res.body, { result: "successfully updated", "_id": issueId })

                    done()
                })
        });

        test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function (done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: issueId,
                    status_text: 'Updating',
                    issue_title: "New title"
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200)
                    assert.deepEqual(res.body, { result: "successfully updated", "_id": issueId })

                    done()
                })
        });

        test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    status_text: 'Updating',
                    issue_title: "New title"
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200)
                    assert.deepEqual(res.body, { error: "missing _id" })

                    done()
                })
        });

        test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function (done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: issueId,
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200)
                    assert.deepEqual(res.body, { error: "no update field(s) sent", "_id": issueId })

                    done()
                })
        });

        test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
            const invalidId = 231242452
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: invalidId,
                    status_text: 'Updating',
                    issue_title: "New title"
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200)
                    assert.deepEqual(res.body, { error: 'could not update', '_id': invalidId })

                    done()
                })
        });
    })

    suite("Delete requests", function () {
        test("Delete an issue: DELETE request to /api/issues/{project}", function (done) {
            chai.request(server)
                .delete('/api/issues/test')
                .send({ _id: issueId })
                .end(function (err, res) {
                    assert.equal(res.status, 200)
                    assert.deepEqual(res.body, { result: 'successfully deleted', "_id": issueId })

                    done()
                })
        });

        test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
            const invalidId = 84959599
            chai.request(server)
                .delete('/api/issues/test')
                .send({ _id: invalidId })
                .end(function (err, res) {
                    assert.equal(res.status, 200)
                    assert.deepEqual(res.body, { error: "could not delete", "_id": invalidId })

                    done()
                })
        });

        test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
            chai.request(server)
                .delete('/api/issues/test')
                .send({})
                .end(function (err, res) {
                    assert.equal(res.status, 200)
                    assert.deepEqual(res.body, { error: "missing _id" })

                    done()
                })
        });
    })

    suite("Get requests", function () {
        test("View issues on a project: GET request to /api/issues/{project}", function (done) {
            chai
                .request(server)
                .get("/api/issues/test")
                .end((err, res) => {
                    assert.equal(res.status, 200)
                    

                    done()
                })
        });

        test("View issues on a project with one filter: GET request to /api/issues/{project}", function (done) {
            chai
                .request(server)
                .get("/api/issues/test")
                .query({
                    open: true
                })
                .end((err, res) => {
                    assert.equal(res.status, 200)

                    done()
                })
        });

        test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function (done) {
            chai
                .request(server)
                .get("/api/issues/test")
                .query({
                    open: true,
                    created_by: "Joe"
                })
                .end((err, res) => {
                    assert.equal(res.status, 200)
                    
                    done()
                })
        });
    })
});
