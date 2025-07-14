import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";

export async function POST() {
  try {
    const records = await db.insert(advocates).values(advocateData).returning();
    return Response.json({ 
      success: true,
      advocates: records,
      count: records.length 
    });
  } catch (error) {
    return Response.json(
      { 
        success: false,
        error: 'Failed to seed database',
        message: 'Unable to insert advocate data'
      },
      { status: 500 }
    );
  }
}
