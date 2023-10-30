const z = require('zod');
const { queue, jobs } = require('../queue/report');

const body = z.object({
  sheetrange: z.string(),
  cells: z.array(z.array(z.any())).min(1),
});

const query = z.object({
  job: z.string(),
}).extend({
  job: z.custom(i => jobs.some((job) => job.id === i)),
});

async function post(req, res) {
  const { error} = body.safeParse(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const filename = `${new Date().toISOString()}.pdf`;
  
  jobs.push({
    id: filename,
    status: 'pending',
    results: null,
  });
  
  queue.push({ filename, ...req.body });
  
  res.status(200).json({ job: filename });
};

async function get(req, res) {
  const { error, data } = query.safeParse(req.query);

  if (error) {
    return res.status(400).json({ error });
  }

  return res.status(200).json(jobs.find((job) => job.id === data.job));
};

module.exports = { post, get };