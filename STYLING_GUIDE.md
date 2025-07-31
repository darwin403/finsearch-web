# Styling Guide for Finsearch Web

## Design Philosophy

- **Minimal & Clean**: Prioritize clarity over decoration
- **User-Centric**: Minimize clicks to complete tasks
- **Consistent**: Use established patterns throughout

## Color Palette

### Primary Colors

```css
/* Text */
text-slate-900 dark:text-slate-100     /* Primary text */
text-slate-700 dark:text-slate-300     /* Secondary text */
text-muted-foreground                   /* Tertiary/helper text */

/* Backgrounds */
bg-white dark:bg-slate-950             /* Page background */
bg-slate-100 dark:bg-slate-800         /* Subtle backgrounds */
bg-slate-50 dark:bg-slate-900          /* Hover states */

/* Accents */
bg-blue-600 hover:bg-blue-700          /* Primary actions */
text-blue-600 dark:text-blue-400       /* Links and active states */
border-slate-200 dark:border-slate-800 /* Borders */
```

## Layout Structure

### Page Header Pattern

```tsx
<div className="flex items-center gap-1.5 mb-2">
  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
    Page Title
  </h1>
  <TooltipProvider delayDuration={100}>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Helpful context without cluttering the UI</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div>
<p className="text-muted-foreground mb-4">
  Brief, descriptive subtitle
</p>
```

### Content Containers

- Use `Card` component for main content areas
- Apply `border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm`
- Use `p-6` for content padding
- Add `space-y-6` for consistent vertical spacing

## Component Standards

### Buttons

```tsx
/* Primary Actions */
<Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-slate-950">

/* Secondary Actions */
<Button variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">

/* Icon Buttons */
<Button variant="outline" size="icon" className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
```

### Form Elements

```tsx
/* Inputs */
<Input className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-blue-500 dark:text-slate-50" />

/* Textareas */
<Textarea className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-blue-500 dark:text-slate-50" />

/* Labels */
<label className="text-sm font-medium text-slate-700 dark:text-slate-300">
```

### Navigation/Tabs

```tsx
<TabsTrigger className="h-11 px-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-500 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
```

## Responsive Design

### Breakpoints

- Use `md:` prefix for desktop layouts
- Stack elements vertically on mobile, horizontally on desktop
- Apply `flex-col md:flex-row` pattern consistently

### Control Groups

```tsx
<div className="flex flex-col gap-y-3 mb-6 md:flex-row md:items-center md:justify-between md:gap-x-4 md:gap-y-0">
  {/* Left controls */}
  <div className="flex flex-row flex-wrap items-center gap-2 w-full md:w-auto">

  {/* Right controls */}
  <div className="flex flex-col gap-y-2 w-full md:flex-row md:items-center md:gap-3 md:w-auto">
```

## Icon Standards

- Use `h-4 w-4` for standard icons
- Use `h-3.5 w-3.5` for small action icons
- Apply `text-slate-500 dark:text-slate-400` for muted icons
- Add hover states: `hover:text-slate-700 dark:hover:text-slate-200`

## Interactive States

### Hover Effects

```css
hover:bg-slate-100 dark:hover:bg-slate-800     /* Subtle backgrounds */
hover:text-slate-800 dark:hover:text-slate-200 /* Text color changes */
```

### Disabled States

```css
disabled: opacity-50; /* Visual feedback */
```

### Focus States

```css
focus:ring-blue-500                           /* Form elements */
focus-visible:opacity-100                     /* Action buttons */
```

## Spacing System

- `gap-2` (8px) for closely related elements
- `gap-4` (16px) for standard element spacing
- `gap-6` (24px) for section spacing
- `space-y-6` for consistent vertical rhythm
- `p-4` for compact padding, `p-6` for comfortable padding

## Dialog/Modal Patterns

```tsx
<DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
  <DialogHeader>
    <DialogTitle className="text-slate-900 dark:text-slate-100">
    <DialogDescription className="text-slate-600 dark:text-slate-400">
  </DialogHeader>
  <div className="space-y-4 py-4">
    {/* Form content with consistent spacing */}
  </div>
  <DialogFooter>
    <Button variant="outline">Cancel</Button>
    <Button>Confirm</Button>
  </DialogFooter>
</DialogContent>
```

## Key Principles

1. **Consistency First**: Reuse established patterns
2. **Progressive Disclosure**: Use tooltips for additional context
3. **Accessibility**: Proper ARIA labels and keyboard navigation
4. **Performance**: Leverage shadcn/ui components
5. **Dark Mode**: Always include dark mode variants
6. **Mobile-First**: Design for mobile, enhance for desktop

## Don'ts

- Avoid custom colors outside the established palette
- Don't use excessive shadows or gradients
- Avoid cluttered layouts with too many visual elements
- Don't break the established spacing system
- Avoid custom components when shadcn/ui equivalents exist
