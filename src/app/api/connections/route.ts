import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, connections, startups, stakeholders } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { ConnectionRequestSchema } from "@/lib/validations";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user to determine their role
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let userConnections;

    if (user.userType === "startup") {
      // Get startup's profile to find their connections
      const startup = await db.query.startups.findFirst({
        where: eq(startups.userId, user.id),
      });

      if (!startup) {
        return NextResponse.json({ error: "Startup profile not found" }, { status: 404 });
      }

      // Get connections where this startup is involved
      userConnections = await db
        .select({
          id: connections.id,
          startupId: connections.startupId,
          stakeholderId: connections.stakeholderId,
          status: connections.status,
          initiatedBy: connections.initiatedBy,
          message: connections.message,
          response: connections.response,
          aiMatchScore: connections.aiMatchScore,
          matchReasons: connections.matchReasons,
          meetingScheduled: connections.meetingScheduled,
          followUpCompleted: connections.followUpCompleted,
          connectionOutcome: connections.connectionOutcome,
          feedback: connections.feedback,
          createdAt: connections.createdAt,
          updatedAt: connections.updatedAt,
          // Include stakeholder details
          stakeholderName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
          stakeholderTitle: stakeholders.title,
          stakeholderDepartment: stakeholders.department,
          stakeholderEmail: users.email,
        })
        .from(connections)
        .innerJoin(stakeholders, eq(connections.stakeholderId, stakeholders.id))
        .innerJoin(users, eq(stakeholders.userId, users.id))
        .where(eq(connections.startupId, startup.id))
        .orderBy(connections.createdAt);

    } else if (user.userType === "stakeholder") {
      // Get stakeholder's profile to find their connections
      const stakeholder = await db.query.stakeholders.findFirst({
        where: eq(stakeholders.userId, user.id),
      });

      if (!stakeholder) {
        return NextResponse.json({ error: "Stakeholder profile not found" }, { status: 404 });
      }

      // Get connections where this stakeholder is involved
      userConnections = await db
        .select({
          id: connections.id,
          startupId: connections.startupId,
          stakeholderId: connections.stakeholderId,
          status: connections.status,
          initiatedBy: connections.initiatedBy,
          message: connections.message,
          response: connections.response,
          aiMatchScore: connections.aiMatchScore,
          matchReasons: connections.matchReasons,
          meetingScheduled: connections.meetingScheduled,
          followUpCompleted: connections.followUpCompleted,
          connectionOutcome: connections.connectionOutcome,
          feedback: connections.feedback,
          createdAt: connections.createdAt,
          updatedAt: connections.updatedAt,
          // Include startup details
          startupName: startups.companyName,
          startupStage: startups.stage,
          startupFocusArea: startups.focusArea,
          startupDescription: startups.description,
          founderName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
          founderEmail: users.email,
        })
        .from(connections)
        .innerJoin(startups, eq(connections.startupId, startups.id))
        .innerJoin(users, eq(startups.userId, users.id))
        .where(eq(connections.stakeholderId, stakeholder.id))
        .orderBy(connections.createdAt);

    } else {
      return NextResponse.json({ error: "Access denied - admin users cannot view connections" }, { status: 403 });
    }

    return NextResponse.json({ connections: userConnections });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user to determine their role
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    
    // Validate the connection request data
    const validatedData = ConnectionRequestSchema.parse(body);

    // Verify the startup and stakeholder exist
    const startup = await db.query.startups.findFirst({
      where: eq(startups.id, validatedData.startupId),
    });

    const stakeholder = await db.query.stakeholders.findFirst({
      where: eq(stakeholders.id, validatedData.stakeholderId),
    });

    if (!startup || !stakeholder) {
      return NextResponse.json({ error: "Startup or stakeholder not found" }, { status: 404 });
    }

    // Check if connection already exists
    const existingConnection = await db.query.connections.findFirst({
      where: and(
        eq(connections.startupId, validatedData.startupId),
        eq(connections.stakeholderId, validatedData.stakeholderId)
      ),
    });

    if (existingConnection) {
      return NextResponse.json({ error: "Connection already exists between these parties" }, { status: 409 });
    }

    // Verify the user has permission to create this connection
    if (user.userType === "startup") {
      const userStartup = await db.query.startups.findFirst({
        where: eq(startups.userId, user.id),
      });
      
      if (!userStartup || userStartup.id !== validatedData.startupId) {
        return NextResponse.json({ error: "Access denied - can only create connections for your own startup" }, { status: 403 });
      }
    } else if (user.userType === "stakeholder") {
      const userStakeholder = await db.query.stakeholders.findFirst({
        where: eq(stakeholders.userId, user.id),
      });
      
      if (!userStakeholder || userStakeholder.id !== validatedData.stakeholderId) {
        return NextResponse.json({ error: "Access denied - can only create connections for yourself" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Access denied - admin users cannot create connections" }, { status: 403 });
    }

    // Create the connection
    const newConnection = await db.insert(connections).values({
      id: crypto.randomUUID(),
      startupId: validatedData.startupId,
      stakeholderId: validatedData.stakeholderId,
      status: "pending",
      initiatedBy: user.id,
      message: validatedData.message,
      // TODO: Add AI matching score calculation here
      aiMatchScore: null,
      matchReasons: null,
    });

    return NextResponse.json(
      { message: "Connection request created successfully", connectionId: newConnection.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating connection:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 