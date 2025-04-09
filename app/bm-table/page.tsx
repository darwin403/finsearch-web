"use client";

import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  Search,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  id: string;
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

export default function BoardMembersTable() {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Sample data - in a real app, this would come from props or an API
  const boardMembers: BoardMember[] = [
    {
      id: "1",
      address:
        "E 721, Cedar Block, Brigade Orchards, Devanahalli,\nBengaluru Rural – 562110, Bangalore Rural, Karnataka,\nIndia",
      designations: ["Chairman and Managing Director"],
      din: "07683267",
      dob: "June 10, 1981",
      education: [
        {
          degree: "diploma in mechanical engineering (GL)",
          institution:
            "Board of Technical Examinations, Government of Karnataka",
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
          company:
            "Quality Engineering & Software Technologies\nPrivate Limited",
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
    },
    {
      id: "2",
      address:
        "No. 12, 5th Cross, Malleswaram, Bangalore - 560003, Karnataka, India",
      designations: ["Independent Director"],
      din: "08245621",
      dob: "March 15, 1975",
      education: [
        {
          degree: "MBA in Finance",
          institution: "Indian Institute of Management, Bangalore",
          year: 2001,
        },
        {
          degree: "Bachelor of Engineering in Computer Science",
          institution: "Bangalore University",
          year: 1997,
        },
      ],
      experience: [
        {
          company: "Tech Solutions India Ltd",
          designation: "Chief Financial Officer",
          role: "financial planning and strategy",
        },
        {
          company: "Global Investments Pvt Ltd",
          designation: "Financial Analyst",
          role: "investment analysis and portfolio management",
        },
      ],
      name: "Priya Sharma",
      occupation: "Finance Professional",
      other_directorships: [
        "Bangalore Financial Services Ltd",
        "Karnataka Tech Investments Pvt Ltd",
      ],
      tenure_start: "April 15, 2020",
    },
    {
      id: "3",
      address:
        "Flat 203, Prestige Heights, MG Road, Bangalore - 560001, Karnataka, India",
      designations: ["Non-Executive Director"],
      din: "09371542",
      dob: "November 22, 1968",
      education: [
        {
          degree: "PhD in Mechanical Engineering",
          institution: "Indian Institute of Science, Bangalore",
          year: 1998,
        },
        {
          degree: "Master of Engineering",
          institution: "Anna University, Chennai",
          year: 1992,
        },
      ],
      experience: [
        {
          company: "Aerospace Systems India",
          designation: "Chief Technology Officer",
          role: "technology strategy and innovation",
        },
        {
          company: "Indian Space Research Organization",
          designation: "Senior Scientist",
          role: "aerospace research and development",
        },
      ],
      name: "Dr. Rajesh Kumar",
      occupation: "Technology Consultant",
      other_directorships: [
        "Indian Aerospace Technologies Ltd",
        "Advanced Materials Research Pvt Ltd",
        "Innovation Council of India",
      ],
      tenure_start: "January 10, 2019",
    },
  ];

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter board members based on search query
  const filteredBoardMembers = boardMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.din.includes(searchQuery) ||
      member.designations.some((d) =>
        d.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      member.occupation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Board Members</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search members..."
                className="w-[250px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead className="hidden md:table-cell">DIN</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Occupation
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Tenure</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBoardMembers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No board members found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBoardMembers.map((member) => (
                    <Collapsible
                      key={member.id}
                      open={expandedRows[member.id]}
                      onOpenChange={() => toggleRowExpansion(member.id)}
                      asChild
                    >
                      <>
                        <TableRow className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">
                            {member.name}
                          </TableCell>
                          <TableCell>
                            {member.designations.map((designation, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="mr-1"
                              >
                                {designation}
                              </Badge>
                            ))}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {member.din}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {member.occupation}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{member.tenure_start}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                {expandedRows[member.id] ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                                <span className="sr-only">Toggle details</span>
                              </Button>
                            </CollapsibleTrigger>
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell colSpan={7} className="p-0">
                              <div className="p-4 bg-muted/30 border-t">
                                <Tabs defaultValue="experience">
                                  <TabsList className="grid w-full max-w-md grid-cols-3">
                                    <TabsTrigger value="experience">
                                      Experience
                                    </TabsTrigger>
                                    <TabsTrigger value="education">
                                      Education
                                    </TabsTrigger>
                                    <TabsTrigger value="details">
                                      Details
                                    </TabsTrigger>
                                  </TabsList>

                                  <TabsContent
                                    value="experience"
                                    className="pt-4"
                                  >
                                    <h3 className="text-sm font-medium mb-3">
                                      Professional Experience
                                    </h3>
                                    <div className="space-y-4">
                                      {member.experience.map((exp, index) => (
                                        <div key={index} className="text-sm">
                                          <div className="font-medium">
                                            {exp.designation}
                                          </div>
                                          <div>{exp.company}</div>
                                          <div className="text-muted-foreground mt-1">
                                            {exp.role}
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    <h3 className="text-sm font-medium mt-6 mb-3">
                                      Other Directorships
                                    </h3>
                                    <ul className="space-y-1 text-sm">
                                      {member.other_directorships.map(
                                        (dir, index) => (
                                          <li
                                            key={index}
                                            className="flex items-start gap-2"
                                          >
                                            <ExternalLink className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <span>{dir}</span>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </TabsContent>

                                  <TabsContent
                                    value="education"
                                    className="pt-4"
                                  >
                                    <h3 className="text-sm font-medium mb-3">
                                      Educational Background
                                    </h3>
                                    <div className="space-y-4">
                                      {member.education.map((edu, index) => (
                                        <div key={index} className="text-sm">
                                          <div className="font-medium capitalize">
                                            {edu.degree}
                                          </div>
                                          <div>{edu.institution}</div>
                                          {edu.year > 0 && (
                                            <div className="text-muted-foreground">
                                              {edu.year}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="details" className="pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <h3 className="font-medium mb-2">
                                          Personal Details
                                        </h3>
                                        <div className="space-y-2">
                                          <div>
                                            <span className="text-muted-foreground">
                                              Date of Birth:
                                            </span>{" "}
                                            {member.dob}
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">
                                              DIN:
                                            </span>{" "}
                                            {member.din}
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">
                                              Occupation:
                                            </span>{" "}
                                            {member.occupation}
                                          </div>
                                        </div>
                                      </div>

                                      <div>
                                        <h3 className="font-medium mb-2">
                                          Contact Information
                                        </h3>
                                        <div>
                                          <span className="text-muted-foreground">
                                            Address:
                                          </span>
                                          <p className="mt-1">
                                            {member.address.replace(
                                              /\n/g,
                                              ", "
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
