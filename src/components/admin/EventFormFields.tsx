import { UseFormReturn, useWatch } from "react-hook-form";
import { EventFormValues } from "@/lib/validations/event";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Calendar, Sparkles, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function IdentityFields({ form }: { form: UseFormReturn<EventFormValues> }) {
  const eventTypes = [
    { value: "wedding", label: "Casamento", icon: "💒" },
    { value: "birthday", label: "Aniversário", icon: "🎂" },
    { value: "corporate", label: "Corporativo", icon: "🏢" },
    { value: "party", label: "Festa", icon: "🎉" },
  ];

  return (
    <Card className="border-none shadow-xl shadow-black/5 dark:bg-[#151518] edit-animate">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FDF2F4] dark:bg-[#E85A70]/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#E85A70]" />
          </div>
          <div>
            <CardTitle className="font-display text-xl">Identidade do Evento</CardTitle>
            <CardDescription>Como as pessoas verão seu evento</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Nome do Evento</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Casamento Maria & João"
                  className="h-12 text-base rounded-xl border-[#ede7e4] dark:border-white/10 focus-visible:ring-[#E85A70]/30 focus-visible:border-[#E85A70]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">URL Personalizada</FormLabel>
              <FormControl>
                <div className="flex rounded-xl overflow-hidden border border-[#ede7e4] dark:border-white/10 focus-within:ring-2 focus-within:ring-[#E85A70]/20 focus-within:border-[#E85A70] transition-all">
                  <span className="hidden sm:inline-flex items-center px-4 bg-[#F8F9FA] dark:bg-white/5 border-r border-[#ede7e4] dark:border-white/10 text-gray-400 text-sm font-medium">
                    lume.com/e/
                  </span>
                  <Input
                    {...field}
                    placeholder="maria-joao-2025"
                    className="h-12 border-0 rounded-none focus-visible:ring-0 bg-white dark:bg-transparent flex-1"
                  />
                </div>
              </FormControl>
              <FormDescription className="text-xs text-gray-400 ml-1">
                Convidados acessarão: <span className="font-semibold text-[#E85A70]"><span className="hidden sm:inline">lume.com/e/</span>{field.value || "seu-evento"}</span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="event_type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-sm font-semibold">Tipo de Evento</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {eventTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => field.onChange(type.value)}
                    className={cn(
                      "p-4 rounded-2xl border-2 text-center transition-all duration-200",
                      field.value === type.value
                        ? "border-[#E85A70] bg-[#FDF2F4] dark:bg-[#E85A70]/10 scale-[0.98]"
                        : "border-[#ede7e4] dark:border-white/5 bg-white dark:bg-white/5 hover:border-[#E85A70]/40"
                    )}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="text-xs font-bold">{type.label}</div>
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

export function DetailsFields({ form }: { form: UseFormReturn<EventFormValues> }) {
  // Otimização: useWatch evita re-render do componente pai (NewEvent/EditEvent)
  const eventType = useWatch({ control: form.control, name: "event_type" });

  return (
    <Card className="border-none shadow-xl shadow-black/5 dark:bg-[#151518] edit-animate">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FDF2F4] dark:bg-[#E85A70]/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#E85A70]" />
          </div>
          <div>
            <CardTitle className="font-display text-xl">Detalhes do Evento</CardTitle>
            <CardDescription>Personalize a experiência dos convidados</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="event_date"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold flex items-center gap-1.5">
                Data do Evento
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  className="h-12 rounded-xl border-[#ede7e4] dark:border-white/10"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {eventType === "wedding" && (
          <div className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 border border-[#ede7e4] dark:border-white/10 space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-2">💒 Nomes do Casal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="couple_name_1"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-semibold text-gray-500">Noivo(a) 1</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Maria" className="rounded-xl" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="couple_name_2"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-semibold text-gray-500">Noivo(a) 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João" className="rounded-xl" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {eventType === "birthday" && (
          <div className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 border border-[#ede7e4] dark:border-white/10 space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-2">🎂 Detalhes do Aniversário</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="birthday_person_name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-semibold text-gray-500">Nome do Aniversariante</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Maria" className="rounded-xl" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthday_age"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-semibold text-gray-500">Idade</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 25" 
                        className="rounded-xl" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {eventType === "corporate" && (
          <div className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 border border-[#ede7e4] dark:border-white/10 space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-2">🏢 Detalhes Corporativos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-semibold text-gray-500">Nome da Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: ACME Inc." className="rounded-xl" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-semibold text-gray-500">Departamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Marketing" className="rounded-xl" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {eventType === "party" && (
          <div className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 border border-[#ede7e4] dark:border-white/10 space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-2">🎉 Detalhes da Festa</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="host_name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-semibold text-gray-500">Nome do Anfitrião</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Carlos" className="rounded-xl" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="party_reason"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-semibold text-gray-500">Motivo da Festa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Graduação" className="rounded-xl" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold">
                Mensagem de Boas-vindas <span className="text-gray-400 font-normal">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Uma mensagem especial para seus convidados..."
                  rows={4}
                  className="rounded-xl border-[#ede7e4] dark:border-white/10 resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

export function AppearanceFields({ form }: { form: UseFormReturn<EventFormValues> }) {
  // Otimização: useWatch evita re-render do componente pai
  const themeColor = useWatch({ control: form.control, name: "theme_color" });

  return (
    <Card className="border-none shadow-xl shadow-black/5 dark:bg-[#151518] edit-animate">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FDF2F4] dark:bg-[#E85A70]/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-[#E85A70]" />
          </div>
          <div>
            <CardTitle className="font-display text-xl">Estilo Visual</CardTitle>
            <CardDescription>Escolha as cores que combinam com seu evento</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <FormField
          control={form.control}
          name="theme_color"
          render={({ field }) => (
            <FormItem className="p-6 rounded-3xl bg-[#F8F9FA] dark:bg-white/5 border border-[#ede7e4] dark:border-white/10">
              <FormLabel className="text-base font-bold mb-4 block text-[#1c1c1e] dark:text-white">Cor do Tema</FormLabel>
              <FormControl>
                <ThemeSelector selected={field.value as any} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#FDF2F4] to-white dark:from-[#E85A70]/10 dark:to-transparent border border-[#E85A70]/20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-xl">
            <div
              className="w-12 h-12 rounded-full"
              style={{ backgroundColor: "var(--theme-primary, #E85A70)" }}
            />
          </div>
          <div>
            <h4 className="font-display font-bold text-lg text-[#1c1c1e] dark:text-white">Preview do Estilo</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sua página de evento usará tons de {themeColor}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
