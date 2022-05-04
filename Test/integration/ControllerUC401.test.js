const { assert } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { it } = require('mocha');
const server = require('../../index');
const DB = require('../../src/data/dbConnection')

//describe('UC-401 sign on participation, (done) =>{});
//describe('UC-402 sign off participation, (done) =>{});
//describe('UC-403 get all participants of that meal, (done) =>{});
//describe('UC-404 get detail of the participant at that meal, (done) =>{});
//Testcases UC-401 to UC-404