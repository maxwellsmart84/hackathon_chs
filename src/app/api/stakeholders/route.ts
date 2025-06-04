import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, stakeholders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { StakeholderProfileSchema } from "@/lib/validations";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user first to verify they exist and are a stakeholder
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.userType !== "stakeholder") {
      return NextResponse.json({ error: "Access denied - not a stakeholder user" }, { status: 403 });
    }

    // Get stakeholder profile
    const stakeholder = await db.query.stakeholders.findFirst({
      where: eq(stakeholders.userId, user.id),
    });

    if (!stakeholder) {
      return NextResponse.json({ error: "Stakeholder profile not found" }, { status: 404 });
    }

    return NextResponse.json({ stakeholder });
  } catch (error) {
    console.error("Error fetching stakeholder:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user first to verify they exist and are a stakeholder
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.userType !== "stakeholder") {
      return NextResponse.json({ error: "Access denied - not a stakeholder user" }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate the stakeholder profile data
    const validatedData = StakeholderProfileSchema.parse(body);

    // Check if stakeholder profile already exists
    const existingStakeholder = await db.query.stakeholders.findFirst({
      where: eq(stakeholders.userId, user.id),
    });

    if (existingStakeholder) {
      return NextResponse.json({ error: "Stakeholder profile already exists" }, { status: 409 });
    }

    // Create stakeholder profile
    const newStakeholder = await db.insert(stakeholders).values({
      id: crypto.randomUUID(),
      userId: user.id,
      ...validatedData,
    });

    // Update user profile completion status
    await db.update(users)
      .set({ 
        profileComplete: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json(
      { message: "Stakeholder profile created successfully", stakeholderId: newStakeholder.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating stakeholder profile:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user first to verify they exist and are a stakeholder
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.userType !== "stakeholder") {
      return NextResponse.json({ error: "Access denied - not a stakeholder user" }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate the updated data
    const validatedData = StakeholderProfileSchema.partial().parse(body);

    // Update stakeholder profile
    await db.update(stakeholders)
      .set({ 
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(stakeholders.userId, user.id));

    return NextResponse.json({ message: "Stakeholder profile updated successfully" });
  } catch (error) {
    console.error("Error updating stakeholder profile:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 