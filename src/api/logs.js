const fs = require('fs');
const z = require('zod');

const query = z.object({
  filename: z.string(),
});

module.exports = async (req, res) => {
  const { error, data } = query.safeParse(req.query);

  if (error) {
    return res.status(400).json({ error });
  }

  fs.readFile(`logs/${data.filename}`, 'utf8', function(err, data) {
    if (err) {
      return res.status(500).end('Error reading logs');
    }
    
    res.setHeader('Content-disposition', 'attachment; filename=combined.log');
    res.setHeader('Content-type', 'text/plain');
    res.charset = 'UTF-8';
    res.write(data);
    res.end();
  });
};