import * as React from "react"
import { CourseDocument } from "@/types/course"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Download, Upload } from "lucide-react"

interface JsonSchemaInspectorProps {
  course: CourseDocument | null
  setCourse: (course: CourseDocument) => void
}

export function JsonSchemaInspector({ course, setCourse }: JsonSchemaInspectorProps) {
  const [showJson, setShowJson] = React.useState(false)
  const [jsonText, setJsonText] = React.useState("")

  const handleExport = () => {
    setJsonText(JSON.stringify(course, null, 2))
    setShowJson(true)
  }

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonText)
      // basic runtime check for course document
      if (parsed && typeof parsed === 'object' && parsed.id && Array.isArray(parsed.lessons)) {
        setCourse(parsed)
        setShowJson(false)
      } else {
        alert("JSON must be a valid CourseDocument with an id and lessons array.")
      }
    } catch {
      alert("Invalid JSON format.")
    }
  }

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span>Course Document Architecture Schema</span>
          {course ? (
             <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
               <CheckCircle2 className="w-3 h-3 mr-1" />
               Valid Schema
             </Badge>
          ) : (
             <Badge variant="destructive" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20">
               <AlertCircle className="w-3 h-3 mr-1" />
               No Course
             </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-3">

        {showJson ? (
          <div className="flex flex-col gap-2 mt-2">
            <textarea
               className="w-full h-48 p-2 font-mono text-xs border rounded bg-muted/50"
               value={jsonText}
               onChange={(e) => setJsonText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
               <Button variant="ghost" size="sm" onClick={() => setShowJson(false)}>Cancel</Button>
               <Button size="sm" onClick={handleImport}><Upload className="w-4 h-4 mr-2"/> Apply JSON</Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center mt-2">
             <div className="text-xs text-muted-foreground">
                {course?.lessons?.length || 0} lessons total
             </div>
             <Button variant="outline" size="sm" onClick={handleExport} disabled={!course}>
                <Download className="w-4 h-4 mr-2" />
                Export / Import JSON
             </Button>
          </div>
        )}

      </CardContent>
    </Card>
  )
}
