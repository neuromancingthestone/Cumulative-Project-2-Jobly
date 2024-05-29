"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
        title: "New Job", 
        salary: 200000, 
        equity: 0.010, 
        company_handle: "c1"
    };
  
    test("works", async function () {
      let job = await Job.create(newJob);
      expect(job).toEqual({
        id: expect.any(Number),
        title: "New Job",
        salary: 200000,
        equity: "0.01",
        company_handle: "c1"});
  
      const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
             FROM jobs
             WHERE title = 'New Job'`);
      expect(result.rows).toEqual([
        {
          id: expect.any(Number),
          title: "New Job",
          salary: 200000,
          equity: "0.01",
          company_handle: "c1",
        },
      ]);
    });
  
    test("bad request with dupe", async function () {
      try {
        await Job.create(newJob);
        await Job.create(newJob);
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
  });
  


/************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    const jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "Test Job 1",
        salary: 10000,
        equity: "0",
        company_handle: "c1",
      },
      {
        id: expect.any(Number),
        title: "Test Job 2",
        salary: 200000,
        equity: "0.020",
        company_handle: "c2",
      },
    ]);
  });
});

// /************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
      id: 1,
      title: "Test Job 1", 
      salary: 10000, 
      equity: "0", 
      company_handle: "c1",    
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// /************************************** update */

describe("update", function () {
  const updateData = {
    title: "Update Job",
    salary: 300000,
    equity: 0,
    company_handle: "c2",
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      id: 1,
      title: "Update Job",
      salary: 300000,
      equity: "0",
      company_handle: "c2",
    });
  });

  test("not found if no such job id", async function () {
    try {
      await Job.update(0, {
        title: "NOPE JOB SHOULD ERROR",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if no data", async function () {
    expect.assertions(1);
    try {
      await Job.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
        "SELECT * FROM jobs WHERE id = 1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such user", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
