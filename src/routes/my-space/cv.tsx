import { api } from "@convex/_generated/api";
import { SkillLevel, LanguageLevel } from "@convex/lib/constants";
import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  Brain,
  Briefcase,
  Download,
  Edit,
  FileText,
  Globe,
  GraduationCap,
  Languages,
  Loader2,
  Palette,
  Plus,
  Save,
  Sparkles,
  Target,
  Trash2,
  Upload,
  User,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useAction } from "convex/react";
import { useReactToPrint } from "react-to-print";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CVPreview } from "@/components/cv/CVPreview";
import { CVImportModal } from "@/components/cv/CVImportModal";
import type { CVData, CVTheme } from "@/components/cv/types";

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE
// ═══════════════════════════════════════════════════════════════════════════

export const Route = createFileRoute("/my-space/cv")({
  component: CVPage,
});

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const THEMES: { id: CVTheme; label: string; description: string }[] = [
  {
    id: "modern",
    label: "Modern",
    description: "Sidebar sombre, design épuré",
  },
  { id: "classic", label: "Classique", description: "Traditionnel et élégant" },
  { id: "minimalist", label: "Minimaliste", description: "Espace et clarté" },
  {
    id: "professional",
    label: "Professionnel",
    description: "Corporate et structuré",
  },
  { id: "creative", label: "Créatif", description: "Coloré et audacieux" },
  { id: "elegant", label: "Élégant", description: "Raffiné et sophistiqué" },
];

const CV_LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "ar", label: "العربية" },
];

const EMPTY_CV: CVData = {
  firstName: "",
  lastName: "",
  title: "",
  objective: "",
  email: "",
  phone: "",
  address: "",
  summary: "",
  experiences: [],
  education: [],
  skills: [],
  languages: [],
  hobbies: [],
  portfolioUrl: "",
  linkedinUrl: "",
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function CVPage() {
  const { t } = useTranslation();

  // Data
  const cvData = useQuery(api.functions.cv.getMine);
  const upsertCV = useMutation(api.functions.cv.upsert);
  const addSkill = useMutation(api.functions.cv.addSkill);

  // AI actions
  const improveSummaryAI = useAction(api.functions.cvAI.improveSummary);
  const suggestSkillsAI = useAction(api.functions.cvAI.suggestSkills);
  const optimizeForJobAI = useAction(api.functions.cvAI.optimizeForJob);
  const generateCoverLetterAI = useAction(
    api.functions.cvAI.generateCoverLetter,
  );
  const atsScoreAI = useAction(api.functions.cvAI.atsScore);
  const translateCVAI = useAction(api.functions.cvAI.translateCV);

  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<CVTheme>("modern");
  const [showImportModal, setShowImportModal] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiPanel, setAiPanel] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [coverLetterResult, setCoverLetterResult] = useState<string | null>(
    null,
  );
  const [atsResult, setAtsResult] = useState<{
    score: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } | null>(null);
  const [skillSuggestions, setSkillSuggestions] = useState<Array<{
    name: string;
    level: string;
    reason: string;
  }> | null>(null);

  // AI form states
  const [jobDescription, setJobDescription] = useState("");
  const [coverLetterJob, setCoverLetterJob] = useState("");
  const [coverLetterCompany, setCoverLetterCompany] = useState("");
  const [coverLetterStyle, setCoverLetterStyle] = useState("formal");
  const [coverLetterExtra, setCoverLetterExtra] = useState("");
  const [atsTargetJob] = useState("");
  const [translateLang, setTranslateLang] = useState("en");

  // Print ref
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  // ─── Form state for editing ─────────────────────────────────────────────
  const [editForm, setEditForm] = useState<CVData>(EMPTY_CV);

  // Build display data
  const displayData: CVData =
    cvData ?
      {
        firstName: cvData.firstName || "",
        lastName: cvData.lastName || "",
        title: cvData.title || "",
        objective: cvData.objective || "",
        email: cvData.email || "",
        phone: cvData.phone || "",
        address: cvData.address || "",
        summary: cvData.summary || "",
        experiences: cvData.experiences || [],
        education: cvData.education || [],
        skills: cvData.skills || [],
        languages: cvData.languages || [],
        hobbies: cvData.hobbies || [],
        portfolioUrl: cvData.portfolioUrl || "",
        linkedinUrl: cvData.linkedinUrl || "",
      }
    : EMPTY_CV;

  // Set theme from saved preference
  useState(() => {
    if (cvData?.preferredTheme) {
      setSelectedTheme(cvData.preferredTheme as CVTheme);
    }
  });

  // ─── Handlers ───────────────────────────────────────────────────────────

  const startEditing = () => {
    setEditForm({ ...displayData });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveCV = async () => {
    try {
      await upsertCV({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        title: editForm.title,
        objective: editForm.objective,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
        summary: editForm.summary,
        experiences: editForm.experiences.map((e) => ({
          title: e.title,
          company: e.company,
          location: e.location || "",
          startDate: e.startDate,
          endDate: e.endDate,
          current: e.current,
          description: e.description || "",
        })),
        education: editForm.education.map((e) => ({
          degree: e.degree,
          school: e.school,
          location: e.location || "",
          startDate: e.startDate,
          endDate: e.endDate,
          current: e.current,
          description: e.description || "",
        })),
        skills: editForm.skills.map((s) => ({
          name: s.name,
          level: s.level as (typeof SkillLevel)[keyof typeof SkillLevel],
        })),
        languages: editForm.languages.map((l) => ({
          name: l.name,
          level: l.level as (typeof LanguageLevel)[keyof typeof LanguageLevel],
        })),
        hobbies: editForm.hobbies,
        portfolioUrl: editForm.portfolioUrl,
        linkedinUrl: editForm.linkedinUrl,
        preferredTheme: selectedTheme,
      });
      toast.success(t("icv.saved", "CV sauvegardé avec succès"));
      setIsEditing(false);
    } catch (err) {
      toast.error(t("icv.saveError", "Erreur lors de la sauvegarde"));
      console.error(err);
    }
  };

  const handleImport = (data: Partial<CVData>) => {
    setEditForm((prev) => ({
      ...prev,
      ...data,
      experiences: data.experiences || prev.experiences,
      education: data.education || prev.education,
      skills: data.skills || prev.skills,
      languages: data.languages || prev.languages,
    }));
    if (!isEditing) startEditing();
    toast.success(t("icv.imported", "Données importées"));
  };

  // ─── Helpers for CVContext ──────────────────────────────────────────────

  const buildCVContext = useCallback(() => {
    const d = isEditing ? editForm : displayData;
    const parts: string[] = [];
    parts.push(`Nom: ${d.firstName} ${d.lastName}`);
    if (d.title) parts.push(`Titre: ${d.title}`);
    if (d.summary) parts.push(`Résumé: ${d.summary}`);
    if (d.experiences.length) {
      parts.push("Expériences:");
      d.experiences.forEach((e) =>
        parts.push(
          `- ${e.title} chez ${e.company} (${e.startDate}-${e.current ? "Présent" : e.endDate}): ${e.description || ""}`,
        ),
      );
    }
    if (d.education.length) {
      parts.push("Formation:");
      d.education.forEach((e) => parts.push(`- ${e.degree} — ${e.school}`));
    }
    if (d.skills.length) {
      parts.push(`Compétences: ${d.skills.map((s) => s.name).join(", ")}`);
    }
    if (d.languages.length) {
      parts.push(
        `Langues: ${d.languages.map((l) => `${l.name} (${l.level})`).join(", ")}`,
      );
    }
    return parts.join("\n");
  }, [isEditing, editForm, displayData]);

  // ─── AI Handlers ────────────────────────────────────────────────────────

  const handleImproveSummary = async () => {
    const d = isEditing ? editForm : displayData;
    if (!d.summary) {
      toast.error(
        t("icv.ai.noSummary", "Ajoutez d'abord un résumé professionnel"),
      );
      return;
    }
    setAiLoading("improveSummary");
    try {
      const result = await improveSummaryAI({
        summary: d.summary,
        cvContext: buildCVContext(),
      });
      if (isEditing) {
        setEditForm((prev) => ({ ...prev, summary: result.improvedSummary }));
      } else {
        await upsertCV({ summary: result.improvedSummary });
      }
      toast.success(t("icv.ai.summaryImproved", "Résumé amélioré !"));
    } catch (err) {
      toast.error(t("icv.ai.error", "Erreur IA"));
      console.error(err);
    } finally {
      setAiLoading(null);
    }
  };

  const handleSuggestSkills = async () => {
    setAiLoading("suggestSkills");
    try {
      const d = isEditing ? editForm : displayData;
      const result = await suggestSkillsAI({
        cvContext: buildCVContext(),
        existingSkills: d.skills.map((s) => s.name),
      });
      setSkillSuggestions(result.suggestions);
      setAiPanel("suggestSkills");
    } catch (err) {
      toast.error(t("icv.ai.error", "Erreur IA"));
      console.error(err);
    } finally {
      setAiLoading(null);
    }
  };

  const handleAddSuggestedSkill = async (name: string, level: string) => {
    if (isEditing) {
      setEditForm((prev) => ({
        ...prev,
        skills: [...prev.skills, { name, level }],
      }));
    } else {
      await addSkill({
        name,
        level: level as (typeof SkillLevel)[keyof typeof SkillLevel],
      });
    }
    setSkillSuggestions((prev) => prev?.filter((s) => s.name !== name) || null);
    toast.success(`${name} ajouté`);
  };

  const handleOptimizeForJob = async () => {
    if (!jobDescription.trim()) return;
    setAiLoading("optimizeForJob");
    try {
      const result = await optimizeForJobAI({
        cvContext: buildCVContext(),
        jobDescription,
      });
      setAiResult(JSON.stringify(result, null, 2));
      setAiPanel("optimizeResult");
      toast.success(t("icv.ai.optimized", "Analyse terminée"));
    } catch (err) {
      toast.error(t("icv.ai.error", "Erreur IA"));
      console.error(err);
    } finally {
      setAiLoading(null);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!coverLetterJob.trim() || !coverLetterCompany.trim()) return;
    setAiLoading("coverLetter");
    try {
      const result = await generateCoverLetterAI({
        cvContext: buildCVContext(),
        jobTitle: coverLetterJob,
        companyName: coverLetterCompany,
        additionalInfo: coverLetterExtra || undefined,
        style: coverLetterStyle,
      });
      setCoverLetterResult(result.coverLetter);
      setAiPanel("coverLetterResult");
    } catch (err) {
      toast.error(t("icv.ai.error", "Erreur IA"));
      console.error(err);
    } finally {
      setAiLoading(null);
    }
  };

  const handleATSScore = async () => {
    setAiLoading("atsScore");
    try {
      const result = await atsScoreAI({
        cvContext: buildCVContext(),
        targetJob: atsTargetJob || undefined,
      });
      setAtsResult(result);
      setAiPanel("atsResult");
    } catch (err) {
      toast.error(t("icv.ai.error", "Erreur IA"));
      console.error(err);
    } finally {
      setAiLoading(null);
    }
  };

  const handleTranslateCV = async () => {
    setAiLoading("translate");
    const d = isEditing ? editForm : displayData;
    try {
      const result = await translateCVAI({
        firstName: d.firstName,
        lastName: d.lastName,
        title: d.title,
        objective: d.objective,
        summary: d.summary,
        experiences: d.experiences.map((e) => ({
          title: e.title,
          company: e.company,
          location: e.location,
          startDate: e.startDate,
          endDate: e.endDate,
          current: e.current,
          description: e.description,
        })),
        education: d.education.map((e) => ({
          degree: e.degree,
          school: e.school,
          location: e.location,
          startDate: e.startDate,
          endDate: e.endDate,
          current: e.current,
          description: e.description,
        })),
        skills: d.skills,
        languages: d.languages,
        hobbies: d.hobbies,
        targetLanguage: translateLang,
      });

      // Apply translation
      const translated: CVData = {
        ...d,
        title: result.title || d.title,
        objective: result.objective || d.objective,
        summary: result.summary || d.summary,
        experiences: d.experiences.map((e, i) => ({
          ...e,
          title: result.experiences?.[i]?.title || e.title,
          description: result.experiences?.[i]?.description || e.description,
        })),
        skills: d.skills.map((s, i) => ({
          ...s,
          name: result.skills?.[i]?.name || s.name,
        })),
        hobbies: result.hobbies || d.hobbies,
      };

      if (isEditing) {
        setEditForm(translated);
      } else {
        await upsertCV({
          ...translated,
          cvLanguage: translateLang,
          experiences: translated.experiences.map((e) => ({
            title: e.title,
            company: e.company,
            location: e.location || "",
            startDate: e.startDate,
            endDate: e.endDate,
            current: e.current,
            description: e.description || "",
          })),
          education: translated.education.map((e) => ({
            degree: e.degree,
            school: e.school,
            location: e.location || "",
            startDate: e.startDate,
            endDate: e.endDate,
            current: e.current,
            description: e.description || "",
          })),
          skills: translated.skills.map((s) => ({
            name: s.name,
            level: s.level as (typeof SkillLevel)[keyof typeof SkillLevel],
          })),
          languages: translated.languages.map((l) => ({
            name: l.name,
            level:
              l.level as (typeof LanguageLevel)[keyof typeof LanguageLevel],
          })),
        });
      }
      toast.success(t("icv.ai.translated", "CV traduit !"));
    } catch (err) {
      toast.error(t("icv.ai.error", "Erreur IA"));
      console.error(err);
    } finally {
      setAiLoading(null);
    }
  };

  // ─── Loading ────────────────────────────────────────────────────────────

  if (cvData === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 py-6 space-y-5">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="text-primary" size={24} />
            {t("icv.title", "iCV")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t(
              "icv.subtitle",
              "Créez, personnalisez et téléchargez votre CV professionnel",
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportModal(true)}
          >
            <Upload size={15} className="mr-1.5" />
            {t("icv.import.btn", "Importer")}
          </Button>
          {isEditing ?
            <>
              <Button variant="outline" size="sm" onClick={cancelEditing}>
                <X size={15} className="mr-1.5" />
                {t("common.cancel", "Annuler")}
              </Button>
              <Button size="sm" onClick={saveCV}>
                <Save size={15} className="mr-1.5" />
                {t("common.save", "Sauvegarder")}
              </Button>
            </>
          : <>
              <Button variant="outline" size="sm" onClick={startEditing}>
                <Edit size={15} className="mr-1.5" />
                {t("common.edit", "Modifier")}
              </Button>
              <Button size="sm" onClick={() => handlePrint()}>
                <Download size={15} className="mr-1.5" />
                {t("icv.downloadPDF", "Télécharger PDF")}
              </Button>
            </>
          }
        </div>
      </div>

      {/* ─── Main Layout ─────────────────────────────────────────────── */}
      <div className="flex gap-5 items-start">
        {/* ─── Left Panel: Themes + AI ────────────────────────────── */}
        <div className="w-72 shrink-0 space-y-4 hidden lg:block">
          {/* Theme Selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette size={15} />
                {t("icv.themes.title", "Modèles")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {THEMES.map((th) => (
                <button
                  key={th.id}
                  onClick={() => setSelectedTheme(th.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedTheme === th.id ?
                      "bg-primary text-primary-foreground"
                    : "hover:bg-muted/80"
                  }`}
                >
                  <span className="font-medium">{th.label}</span>
                  <span className="block text-xs opacity-70">
                    {th.description}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles size={15} className="text-amber-500" />
                {t("icv.ai.title", "IA Assistant")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <AIButton
                icon={<Wand2 size={14} />}
                label={t("icv.ai.improveProfile", "Améliorer le Profil")}
                loading={aiLoading === "improveSummary"}
                onClick={handleImproveSummary}
              />
              <AIButton
                icon={<Brain size={14} />}
                label={t("icv.ai.suggestSkills", "Suggérer Compétences")}
                loading={aiLoading === "suggestSkills"}
                onClick={handleSuggestSkills}
              />
              <AIButton
                icon={<Target size={14} />}
                label={t("icv.ai.optimizeJob", "Optimiser pour Poste")}
                loading={aiLoading === "optimizeForJob"}
                onClick={() =>
                  setAiPanel(
                    aiPanel === "optimizeForJob" ? null : "optimizeForJob",
                  )
                }
              />
              <AIButton
                icon={<FileText size={14} />}
                label={t("icv.ai.coverLetter", "Lettre de Motivation")}
                loading={aiLoading === "coverLetter"}
                onClick={() =>
                  setAiPanel(aiPanel === "coverLetter" ? null : "coverLetter")
                }
              />
              <AIButton
                icon={<Zap size={14} />}
                label={t("icv.ai.atsScore", "Score ATS")}
                loading={aiLoading === "atsScore"}
                onClick={handleATSScore}
              />

              <Separator className="my-2" />

              {/* Language translation */}
              <div className="space-y-2">
                <p className="text-xs font-medium flex items-center gap-1.5">
                  <Globe size={13} />
                  {t("icv.ai.translateCV", "Traduire le CV")}
                </p>
                <div className="flex gap-1.5">
                  <Select
                    value={translateLang}
                    onValueChange={setTranslateLang}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CV_LANGUAGES.map((l) => (
                        <SelectItem key={l.code} value={l.code}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3"
                    disabled={aiLoading === "translate"}
                    onClick={handleTranslateCV}
                  >
                    {aiLoading === "translate" ?
                      <Loader2 className="animate-spin" size={13} />
                    : <Languages size={13} />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Panels (expandable) */}
          <AnimatePresence>
            {aiPanel === "optimizeForJob" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <p className="text-xs font-medium">
                      {t("icv.ai.jobDescLabel", "Description du poste")}
                    </p>
                    <Textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder={t(
                        "icv.ai.jobDescPlaceholder",
                        "Collez la description du poste ou l'URL de l'offre...",
                      )}
                      className="text-xs h-24"
                    />
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handleOptimizeForJob}
                      disabled={aiLoading === "optimizeForJob"}
                    >
                      {aiLoading === "optimizeForJob" ?
                        <Loader2 className="animate-spin mr-2" size={14} />
                      : <Target size={14} className="mr-2" />}
                      {t("icv.ai.analyzeBtn", "Analyser")}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {aiPanel === "coverLetter" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardContent className="pt-4 space-y-2">
                    <Input
                      value={coverLetterJob}
                      onChange={(e) => setCoverLetterJob(e.target.value)}
                      placeholder={t("icv.ai.clJobPlaceholder", "Poste visé")}
                      className="text-xs h-8"
                    />
                    <Input
                      value={coverLetterCompany}
                      onChange={(e) => setCoverLetterCompany(e.target.value)}
                      placeholder={t(
                        "icv.ai.clCompanyPlaceholder",
                        "Nom de l'entreprise",
                      )}
                      className="text-xs h-8"
                    />
                    <Select
                      value={coverLetterStyle}
                      onValueChange={setCoverLetterStyle}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">
                          {t("icv.ai.styleFormal", "Formel")}
                        </SelectItem>
                        <SelectItem value="modern">
                          {t("icv.ai.styleModern", "Moderne")}
                        </SelectItem>
                        <SelectItem value="creative">
                          {t("icv.ai.styleCreative", "Créatif")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      value={coverLetterExtra}
                      onChange={(e) => setCoverLetterExtra(e.target.value)}
                      placeholder={t(
                        "icv.ai.clExtraPlaceholder",
                        "Infos supplémentaires (optionnel)",
                      )}
                      className="text-xs h-16"
                    />
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handleGenerateCoverLetter}
                      disabled={aiLoading === "coverLetter"}
                    >
                      {aiLoading === "coverLetter" ?
                        <Loader2 className="animate-spin mr-2" size={14} />
                      : <FileText size={14} className="mr-2" />}
                      {t("icv.ai.generateBtn", "Générer")}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Skill Suggestions */}
            {aiPanel === "suggestSkills" && skillSuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardContent className="pt-4 space-y-2">
                    <p className="text-xs font-semibold mb-2">
                      {t(
                        "icv.ai.suggestedSkillsTitle",
                        "Compétences suggérées",
                      )}
                    </p>
                    {skillSuggestions.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <button
                          onClick={() =>
                            handleAddSuggestedSkill(s.name, s.level)
                          }
                          className="shrink-0 w-5 h-5 rounded bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center"
                        >
                          <Plus size={12} />
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{s.name}</span>
                          <span className="text-muted-foreground ml-1">
                            ({s.level})
                          </span>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {s.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setAiPanel(null)}
                    >
                      {t("common.close", "Fermer")}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Optimize Result */}
            {aiPanel === "optimizeResult" && aiResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardContent className="pt-4">
                    <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {aiResult}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs mt-2"
                      onClick={() => setAiPanel(null)}
                    >
                      {t("common.close", "Fermer")}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Cover Letter Result */}
            {aiPanel === "coverLetterResult" && coverLetterResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
                      {coverLetterResult}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(coverLetterResult);
                          toast.success(t("icv.ai.copied", "Copié !"));
                        }}
                      >
                        {t("icv.ai.copy", "Copier")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setAiPanel(null)}
                      >
                        {t("common.close", "Fermer")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ATS Score Result */}
            {aiPanel === "atsResult" && atsResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`text-3xl font-bold ${
                          atsResult.score >= 80 ? "text-green-500"
                          : atsResult.score >= 60 ? "text-amber-500"
                          : "text-red-500"
                        }`}
                      >
                        {atsResult.score}
                      </div>
                      <div className="text-xs text-muted-foreground">/100</div>
                    </div>
                    {atsResult.strengths.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-green-600 mb-1">
                          ✓ Points forts
                        </p>
                        {atsResult.strengths.map((s, i) => (
                          <p
                            key={i}
                            className="text-[10px] text-muted-foreground"
                          >
                            • {s}
                          </p>
                        ))}
                      </div>
                    )}
                    {atsResult.weaknesses.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-red-600 mb-1">
                          ✗ Points faibles
                        </p>
                        {atsResult.weaknesses.map((w, i) => (
                          <p
                            key={i}
                            className="text-[10px] text-muted-foreground"
                          >
                            • {w}
                          </p>
                        ))}
                      </div>
                    )}
                    {atsResult.recommendations.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-blue-600 mb-1">
                          → Recommandations
                        </p>
                        {atsResult.recommendations.map((r, i) => (
                          <p
                            key={i}
                            className="text-[10px] text-muted-foreground"
                          >
                            • {r}
                          </p>
                        ))}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setAiPanel(null)}
                    >
                      {t("common.close", "Fermer")}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Center: CV Preview or Edit Form ────────────────────── */}
        <div className="flex-1 min-w-0">
          {isEditing ?
            <EditForm form={editForm} setForm={setEditForm} t={t} />
          : <div className="bg-muted/30 rounded-xl p-4 flex items-start justify-center">
              <div
                ref={printRef}
                className="w-full max-w-[800px] shadow-xl rounded-lg overflow-hidden"
                style={{ aspectRatio: "210/297" }}
              >
                <CVPreview data={displayData} theme={selectedTheme} />
              </div>
            </div>
          }
        </div>
      </div>

      {/* Import Modal */}
      <CVImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function AIButton({
  icon,
  label,
  loading,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium hover:bg-muted/80 transition-all disabled:opacity-50 text-left"
    >
      {loading ?
        <Loader2 className="animate-spin shrink-0" size={14} />
      : icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EDIT FORM
// ═══════════════════════════════════════════════════════════════════════════

function EditForm({
  form,
  setForm,
  t,
}: {
  form: CVData;
  setForm: React.Dispatch<React.SetStateAction<CVData>>;
  t: (key: string, fallback?: string) => string;
}) {
  const updateField = (field: keyof CVData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-5">
      {/* Personal Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User size={15} />
            {t("icv.form.personalInfo", "Informations Personnelles")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium mb-1 block">
              {t("common.firstName", "Prénom")}
            </label>
            <Input
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              className="h-9"
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">
              {t("common.lastName", "Nom")}
            </label>
            <Input
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              className="h-9"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium mb-1 block">
              {t("icv.form.title", "Titre Professionnel")}
            </label>
            <Input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Ex: Développeur Full Stack"
              className="h-9"
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">
              {t("icv.form.email", "Email")}
            </label>
            <Input
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              type="email"
              className="h-9"
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">
              {t("icv.form.phone", "Téléphone")}
            </label>
            <Input
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="h-9"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium mb-1 block">
              {t("icv.form.address", "Adresse")}
            </label>
            <Input
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              className="h-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText size={15} />
            {t("icv.form.summary", "Résumé Professionnel")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.summary}
            onChange={(e) => updateField("summary", e.target.value)}
            placeholder={t(
              "icv.form.summaryPlaceholder",
              "Décrivez votre profil en quelques phrases...",
            )}
            className="h-24"
          />
        </CardContent>
      </Card>

      {/* Experiences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Briefcase size={15} />
              {t("icv.form.experiences", "Expériences")}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  experiences: [
                    ...prev.experiences,
                    {
                      title: "",
                      company: "",
                      location: "",
                      startDate: "",
                      endDate: "",
                      current: false,
                      description: "",
                    },
                  ],
                }))
              }
            >
              <Plus size={13} className="mr-1" />
              {t("icv.form.add", "Ajouter")}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.experiences.map((exp, i) => (
            <div
              key={i}
              className="border rounded-lg p-3 space-y-2 relative group"
            >
              <button
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    experiences: prev.experiences.filter((_, j) => j !== i),
                  }))
                }
              >
                <Trash2 size={14} />
              </button>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder={t("icv.form.jobTitle", "Titre du poste")}
                  value={exp.title}
                  onChange={(e) => {
                    const updated = [...form.experiences];
                    updated[i] = { ...updated[i], title: e.target.value };
                    setForm((prev) => ({ ...prev, experiences: updated }));
                  }}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder={t("icv.form.company", "Entreprise")}
                  value={exp.company}
                  onChange={(e) => {
                    const updated = [...form.experiences];
                    updated[i] = { ...updated[i], company: e.target.value };
                    setForm((prev) => ({ ...prev, experiences: updated }));
                  }}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder={t("icv.form.location", "Lieu")}
                  value={exp.location || ""}
                  onChange={(e) => {
                    const updated = [...form.experiences];
                    updated[i] = { ...updated[i], location: e.target.value };
                    setForm((prev) => ({ ...prev, experiences: updated }));
                  }}
                  className="h-8 text-sm"
                />
                <div className="flex gap-2">
                  <Input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => {
                      const updated = [...form.experiences];
                      updated[i] = { ...updated[i], startDate: e.target.value };
                      setForm((prev) => ({ ...prev, experiences: updated }));
                    }}
                    className="h-8 text-sm flex-1"
                  />
                  <Input
                    type="month"
                    value={exp.endDate || ""}
                    disabled={exp.current}
                    onChange={(e) => {
                      const updated = [...form.experiences];
                      updated[i] = { ...updated[i], endDate: e.target.value };
                      setForm((prev) => ({ ...prev, experiences: updated }));
                    }}
                    className="h-8 text-sm flex-1"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => {
                    const updated = [...form.experiences];
                    updated[i] = { ...updated[i], current: e.target.checked };
                    setForm((prev) => ({ ...prev, experiences: updated }));
                  }}
                />
                {t("icv.form.currentPosition", "Poste actuel")}
              </label>
              <Textarea
                placeholder={t(
                  "icv.form.description",
                  "Description des missions...",
                )}
                value={exp.description || ""}
                onChange={(e) => {
                  const updated = [...form.experiences];
                  updated[i] = { ...updated[i], description: e.target.value };
                  setForm((prev) => ({ ...prev, experiences: updated }));
                }}
                className="h-16 text-sm"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <GraduationCap size={15} />
              {t("icv.form.education", "Formation")}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  education: [
                    ...prev.education,
                    {
                      degree: "",
                      school: "",
                      location: "",
                      startDate: "",
                      endDate: "",
                      current: false,
                      description: "",
                    },
                  ],
                }))
              }
            >
              <Plus size={13} className="mr-1" />
              {t("icv.form.add", "Ajouter")}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.education.map((edu, i) => (
            <div
              key={i}
              className="border rounded-lg p-3 space-y-2 relative group"
            >
              <button
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    education: prev.education.filter((_, j) => j !== i),
                  }))
                }
              >
                <Trash2 size={14} />
              </button>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder={t("icv.form.degree", "Diplôme")}
                  value={edu.degree}
                  onChange={(e) => {
                    const updated = [...form.education];
                    updated[i] = { ...updated[i], degree: e.target.value };
                    setForm((prev) => ({ ...prev, education: updated }));
                  }}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder={t("icv.form.school", "Établissement")}
                  value={edu.school}
                  onChange={(e) => {
                    const updated = [...form.education];
                    updated[i] = { ...updated[i], school: e.target.value };
                    setForm((prev) => ({ ...prev, education: updated }));
                  }}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder={t("icv.form.location", "Lieu")}
                  value={edu.location || ""}
                  onChange={(e) => {
                    const updated = [...form.education];
                    updated[i] = { ...updated[i], location: e.target.value };
                    setForm((prev) => ({ ...prev, education: updated }));
                  }}
                  className="h-8 text-sm"
                />
                <div className="flex gap-2">
                  <Input
                    type="month"
                    value={edu.startDate}
                    onChange={(e) => {
                      const updated = [...form.education];
                      updated[i] = { ...updated[i], startDate: e.target.value };
                      setForm((prev) => ({ ...prev, education: updated }));
                    }}
                    className="h-8 text-sm flex-1"
                  />
                  <Input
                    type="month"
                    value={edu.endDate || ""}
                    onChange={(e) => {
                      const updated = [...form.education];
                      updated[i] = { ...updated[i], endDate: e.target.value };
                      setForm((prev) => ({ ...prev, education: updated }));
                    }}
                    className="h-8 text-sm flex-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Award size={15} />
              {t("icv.form.skills", "Compétences")}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  skills: [...prev.skills, { name: "", level: "Intermediate" }],
                }))
              }
            >
              <Plus size={13} className="mr-1" />
              {t("icv.form.add", "Ajouter")}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {form.skills.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1"
              >
                <Input
                  value={s.name}
                  onChange={(e) => {
                    const updated = [...form.skills];
                    updated[i] = { ...updated[i], name: e.target.value };
                    setForm((prev) => ({ ...prev, skills: updated }));
                  }}
                  className="h-6 w-28 text-xs border-0 bg-transparent p-0"
                  placeholder="Compétence"
                />
                <Select
                  value={s.level}
                  onValueChange={(v) => {
                    const updated = [...form.skills];
                    updated[i] = { ...updated[i], level: v };
                    setForm((prev) => ({ ...prev, skills: updated }));
                  }}
                >
                  <SelectTrigger className="h-6 w-24 text-[10px] border-0 bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(SkillLevel).map((lvl) => (
                      <SelectItem key={lvl} value={lvl} className="text-xs">
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      skills: prev.skills.filter((_, j) => j !== i),
                    }))
                  }
                  className="text-destructive/50 hover:text-destructive"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Languages size={15} />
              {t("icv.form.languages", "Langues")}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  languages: [
                    ...prev.languages,
                    { name: "", level: "Intermediate" },
                  ],
                }))
              }
            >
              <Plus size={13} className="mr-1" />
              {t("icv.form.add", "Ajouter")}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {form.languages.map((l, i) => (
              <div
                key={i}
                className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1"
              >
                <Input
                  value={l.name}
                  onChange={(e) => {
                    const updated = [...form.languages];
                    updated[i] = { ...updated[i], name: e.target.value };
                    setForm((prev) => ({ ...prev, languages: updated }));
                  }}
                  className="h-6 w-24 text-xs border-0 bg-transparent p-0"
                  placeholder="Langue"
                />
                <Select
                  value={l.level}
                  onValueChange={(v) => {
                    const updated = [...form.languages];
                    updated[i] = { ...updated[i], level: v };
                    setForm((prev) => ({ ...prev, languages: updated }));
                  }}
                >
                  <SelectTrigger className="h-6 w-28 text-[10px] border-0 bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(LanguageLevel).map((lvl) => (
                      <SelectItem key={lvl} value={lvl} className="text-xs">
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      languages: prev.languages.filter((_, j) => j !== i),
                    }))
                  }
                  className="text-destructive/50 hover:text-destructive"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Links & Hobbies (compact) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe size={15} />
            {t("icv.form.additional", "Liens & Centres d'intérêt")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">
                Portfolio URL
              </label>
              <Input
                value={form.portfolioUrl}
                onChange={(e) => updateField("portfolioUrl", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">
                LinkedIn URL
              </label>
              <Input
                value={form.linkedinUrl}
                onChange={(e) => updateField("linkedinUrl", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">
              {t(
                "icv.form.hobbies",
                "Centres d'intérêt (séparés par des virgules)",
              )}
            </label>
            <Input
              value={(form.hobbies || []).join(", ")}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  hobbies: e.target.value
                    .split(",")
                    .map((h) => h.trim())
                    .filter(Boolean),
                }))
              }
              placeholder="Lecture, Voyage, Musique..."
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
