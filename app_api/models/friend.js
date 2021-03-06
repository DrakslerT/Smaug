const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *  schemas:
 *   Friend:
 *    type: object
 *    description: Podatki o prijatelju o skupini
 *    properties:
 *     name:
 *      type: string
 *     balance:
 *      type: number
 *    required:
 *     - name
 *     - balance
 *   addFriend:
 *    type: array
 *    description: Podatki za kreiranje nove skupine prijateljev
 *    properties:
 *     name:
 *      type: string
 *      description: Ime prijatelja
 *    required:
 *     - name
 */

const friendSchema = new mongoose.Schema();

friendSchema.add({
    name: {  type: String, required: true },
    balance: { type: Number, required: true }
});

mongoose.model('Friend', friendSchema, 'Friend');

module.exports = {
    friendSchema: friendSchema
}