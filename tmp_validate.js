const { getDMMF } = require('@prisma/sdk');
const fs = require('fs');

async function val() {
  try {
    const datamodel = fs.readFileSync('./prisma/schema.prisma', 'utf-8');
    await getDMMF({ datamodel });
    console.log("VALID");
  } catch (e) {
    console.error("INVALID");
    console.error(e.message);
  }
}

val();
