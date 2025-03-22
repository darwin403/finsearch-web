"use client";

import {
  Calendar,
  Briefcase,
  Building,
  GraduationCap,
  MapPin,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Education {
  degree: string;
  institution: string;
  year: number;
}

interface Experience {
  company: string;
  designation: string;
  role: string;
}

interface BoardMember {
  name: string;
  din: string;
  designations: string[];
  dob: string;
  address: string;
  occupation: string;
  education: Education[];
  experience: Experience[];
  other_directorships: string[];
  tenure_start: string;
}

export default function BoardMemberProfile() {
  // Sample data from the provided JSON
  const boardMember: BoardMember = {
    address:
      "E 721, Cedar Block, Brigade Orchards, Devanahalli,\nBengaluru Rural – 562110, Bangalore Rural, Karnataka,\nIndia",
    designations: ["Chairman and Managing Director"],
    din: "07683267",
    dob: "June 10, 1981",
    education: [
      {
        degree: "diploma in mechanical engineering (GL)",
        institution: "Board of Technical Examinations, Government of Karnataka",
        year: 0,
      },
      {
        degree:
          "bachelor's\ndegree of technology in mechanical engineering (computer integrated manufacturing)",
        institution: "Indira Gandhi National Open\nUniversity, New Delhi",
        year: 0,
      },
    ],
    experience: [
      {
        company: "Quality Engineering & Software Technologies\nPrivate Limited",
        designation: "Project Manager",
        role: "business development functions",
      },
      {
        company: "CIM Tools Private Limited",
        designation:
          "computer - aided\nmanufacturing (CAM) - computer-aided design (CAD) engineer",
        role: "business development functions",
      },
      {
        company: "INCITE CAM Centre",
        designation: "Team Leader –\nCAM division",
        role: "business development functions",
      },
    ],
    name: "Anil Kumar P",
    occupation: "Business",
    other_directorships: [
      "Innomech Aerospace Toolings Private\nLimited",
      "Dheya Engineering Technologies Private\nLimited",
    ],
    tenure_start: "September 1, 2018",
  };

  // Format address for display
  const formattedAddress = boardMember.address.split("\n").join(", ");

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <Card className="mb-6">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <Avatar className="h-20 w-20 border">
              <AvatarFallback className="text-xl font-medium bg-primary/10 text-primary">
                {getInitials(boardMember.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h1 className="text-2xl font-bold">{boardMember.name}</h1>
                {boardMember.designations.map((designation, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="md:ml-2 text-sm"
                  >
                    {designation}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 text-muted-foreground text-sm">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>DIN: {boardMember.din}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>DOB: {boardMember.dob}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{boardMember.occupation}</span>
                </div>
              </div>
              <div className="flex items-start gap-1 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>{formattedAddress}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4" />
            <span>Board Member since {boardMember.tenure_start}</span>
          </div>

          <Tabs defaultValue="experience" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="directorships">Directorships</TabsTrigger>
            </TabsList>

            <TabsContent value="experience" className="pt-4">
              <h2 className="text-lg font-semibold mb-4">
                Professional Experience
              </h2>
              <div className="space-y-6">
                {boardMember.experience.map((exp, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-medium">{exp.designation}</h3>
                        <p className="text-muted-foreground">{exp.company}</p>
                        <p className="text-sm mt-1">{exp.role}</p>
                      </div>
                    </div>
                    {index < boardMember.experience.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="education" className="pt-4">
              <h2 className="text-lg font-semibold mb-4">Education</h2>
              <div className="space-y-6">
                {boardMember.education.map((edu, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-medium capitalize">{edu.degree}</h3>
                        <p className="text-muted-foreground">
                          {edu.institution}
                        </p>
                        {edu.year > 0 && <p className="text-sm">{edu.year}</p>}
                      </div>
                    </div>
                    {index < boardMember.education.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="directorships" className="pt-4">
              <h2 className="text-lg font-semibold mb-4">
                Other Directorships
              </h2>
              <div className="space-y-4">
                {boardMember.other_directorships.map((directorship, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-primary mt-1" />
                    <p>{directorship}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
