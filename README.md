# Algorithm Visualizer

A powerful, intuitive tool for converting natural language pseudocode into professional flowcharts with advanced conditional logic support. Bridge the gap between algorithm design and visual documentation with intelligent block detection, multi-way conditional structures, and real-time visualization.

![Algorithm Visualizer Demo](https://via.placeholder.com/800x400/4CAF50/FFFFFF?text=Algorithm+Visualizer+Demo)

## 🎯 Project Goals

### Primary Objective
Create an accessible algorithm visualization tool that transforms natural language pseudocode into structured, professional flowcharts. Unlike existing code-to-flowchart converters that require strict programming syntax, this tool works with intuitive, conversational algorithm descriptions.

### Target Audience
- **Students** learning algorithmic thinking and computer science concepts
- **Educators** creating visual teaching materials and algorithm explanations
- **Developers** documenting algorithms and system logic flows
- **Technical writers** creating algorithm documentation
- **Anyone** who needs to visualize logical processes and decision flows

### Problem Statement
Most existing flowchart tools fall into two categories:
1. **Manual diagramming tools** (time-consuming, require design skills)
2. **Code-to-flowchart converters** (require specific programming language syntax)

**Gap:** No tool effectively converts natural language algorithm descriptions into professional flowcharts with intelligent structure recognition.

## 🏗️ Technical Implementation

### Architecture Overview
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Input Layer   │    │  Processing      │    │  Output Layer   │
│                 │    │  Engine          │    │                 │
│ • Text Parser   │───▶│ • NLP Analysis   │───▶│ • SVG Generator │
│ • Block         │    │ • Block Type     │    │ • Flow Logic    │
│   Detection     │    │   Classification │    │ • Visual        │
│ • User Interface│    │ • Validation     │    │   Rendering     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Core Technologies

**Frontend Framework**
- **React 18+** with functional components and hooks
- **TypeScript** for type safety and better development experience
- **Tailwind CSS** for responsive, utility-first styling

**Visualization Engine**
- **Custom SVG generation** for scalable, crisp flowcharts
- **Dynamic shape rendering** based on block types
- **Mathematical positioning algorithms** for optimal layout

**Natural Language Processing**
- **Pattern matching algorithms** for keyword detection
- **Context-aware block type suggestion** engine
- **Validation logic** for algorithm structure checking

**Data Management**
- **Browser LocalStorage** for project persistence
- **JSON serialization** for save/load functionality
- **Real-time state management** with React hooks

### Key Algorithms

#### 1. Block Type Classification
```javascript
suggestBlockType(text) {
  // Keyword-based classification with priority weighting
  if (text.includes('start|begin')) return 'start';
  if (text.includes('if|whether|check')) return 'condition';
  if (text.includes('while|repeat')) return 'while';
  if (text.includes('for|loop')) return 'for';
  // ... additional patterns
}
```

#### 2. Flow Connection Logic
- **Sequential flow**: Vertical connections between consecutive blocks
- **Conditional branching**: Right-angle paths for Yes/No decision points
- **Loop-back connections**: Horizontal routing with dashed lines for iterations
- **Single endpoint routing**: All terminating paths converge to one "End" block

#### 3. Smart Layout Engine
- **Vertical spine**: Main algorithm flow down the center
- **Horizontal branches**: Decision paths and loop-backs use side space
- **Collision detection**: Prevents overlapping elements
- **Responsive spacing**: Adjusts based on content and block count

## 🚀 Features & Functionality

### Core Features

#### 📝 Natural Language Input
- **Intuitive syntax**: End lines with `::` to create blocks
- **Flexible phrasing**: Works with conversational algorithm descriptions
- **Real-time parsing**: Instant block detection as you type
- **Smart suggestions**: AI-powered block type recommendations

#### 🎨 Visual Block Types
| Block Type | Shape | Color | Usage |
|------------|-------|-------|-------|
| Start/End | Rounded Rectangle | Green/Red | Algorithm boundaries |
| Process | Rectangle | Blue | General processing steps |
| Input/Output | Parallelogram | Cyan/Pink | Data input/output operations |
| Condition | Diamond | Orange | IF statements and conditionals |
| Else-If | Diamond | Orange Variant | ELSE IF conditional logic |
| Switch | Octagon | Lime Green | Switch statement blocks |
| Case | Trapezoid | Dark Green | Case statement options |
| Loop | Hexagon | Purple | While/For loop structures |
| Function Call | Rectangle + Lines | Indigo | External function execution |
| Function Definition | Rounded + Border | Indigo | Function definitions |
| Return | Inverted Trapezoid | Purple | Function return statements |
| Comment | Dashed Rectangle | Gray | Algorithm documentation |
| Connector | Circle | Purple | Flow connectors |

#### 🔄 Advanced Flow Logic
- **Enhanced Conditional Logic**: Full support for IF/ELSE IF/ELSE chains with cascading layout
- **Smart Content Positioning**: Output blocks positioned directly below their parent conditionals
- **Optimized Connection Routing**: YES arrows flow down, NO arrows branch right
- **Multi-way Branching**: Switch/case statements with proper case routing
- **Loop Visualization**: Color-coded loop-back arrows with depth indicators
- **Professional Styling**: Right-angle connections with no curves or duplicate arrows

#### 🧠 Comprehensive Recursion Analysis
- **Parameter Transformation Tracking**: Automatically detects how parameters change (n-1, node.left, n/2)
- **Base Case Detection**: Identifies exit conditions with comparison operators
- **Recursion Type Classification**: Distinguishes linear, tree, tail, mutual, and nested recursion
- **Stack Overflow Prevention**: Provides warnings for deep recursion (20+, 100+ frames)
- **Interactive Stack Visualization**: Visual call stack with variable tracking and state management

#### 📊 Interactive Stack Frame Visualization
- **Active/Inactive States**: Clear visual distinction between executing and completed frames
- **Variable Tracking**: Real-time display of parameters, local variables, and return values
- **Type Highlighting**: Color-coded variable types (numbers, strings, objects, etc.)
- **Overflow Management**: Handles deep stacks with collapse/expand and "show more" functionality
- **Depth Indicators**: Color-coded depth levels (L1, L2, etc.) with visual hierarchy
- **Performance Optimized**: Efficiently renders 100+ stack frames with smart warnings

#### 🎨 Advanced Depth Visualization System (NEW)
- **Dynamic Color Gradients**: 5 professional color schemes (Blue, Warm, Cool, Rainbow, Monochrome)
- **Depth-Based Intensity Mapping**: Visual progression from light (shallow) to dark (deep) stack levels
- **Smart Collapsible Sections**: Auto-collapse deep stacks (>10 depth) with intelligent grouping by depth ranges
- **Interactive Depth Counters**: Visual urgency indicators (safe/warning/danger) with progress bars for deep recursion
- **WCAG Accessibility Compliance**: Real-time contrast ratio validation ensuring AA/AAA accessibility standards
- **Live Accessibility Testing**: Built-in contrast checking with accessibility level badges (AA/AAA/FAIL)
- **Customizable Settings**: Real-time color scheme switching, high contrast mode, reduced motion support
- **Performance Monitoring**: Adaptive optimization for large stacks with accessibility warnings and recommendations

#### ⚡ Comprehensive Animation System (NEW)
- **Smooth Frame Animations**: Entry/exit transitions with configurable easing and speed controls
- **Staggered Batch Operations**: Performance-optimized animations for multiple frames with intelligent delays
- **Animation Queuing System**: Advanced queue management preventing system overload during rapid operations
- **Adaptive Performance**: Real-time FPS monitoring with automatic optimization based on device capabilities
- **Accessibility Integration**: Full reduced motion support and high contrast compatibility
- **Configurable Controls**: User-controllable animation speeds (slow/normal/fast/instant) with custom easing functions

#### 📐 Integrated Stack Visualization (NEW)
- **Side-by-Side Layout**: Stack panel positioned alongside flowchart for synchronized viewing
- **Responsive Design**: Auto-collapse on small screens with collapsible panels
- **Position Toggle**: Switch stack panel between left and right sides
- **Function Synchronization**: Click function blocks to instantly see simulated stack frames
- **Smart Frame Generation**: Realistic stack frame creation based on function definitions
- **Recursive Detection**: Automatically generates deep stacks for recursive functions
- **Z-Index Management**: Proper layering ensures popups appear above stack panel
- **One-Click Demo**: "Stack Demo" button loads recursive examples instantly

#### 💾 Project Management
- **Save/Load Projects**: Persistent storage with project naming
- **Export Options**: Download as PNG images or text descriptions
- **Version History**: Track changes and iterations (planned)

#### 🛡️ Validation & Error Detection
- **Structure Validation**: Checks for missing start/end blocks
- **Loop Analysis**: Detects potential infinite loops
- **Conditional Logic**: Validates IF statement completeness
- **Recursive Function Validation**: Ensures base cases exist and parameter transformations converge
- **Stack Overflow Detection**: Warns about deep recursion and infinite recursion risks
- **Real-time Feedback**: Visual indicators for issues with detailed error descriptions
- **Accessibility Validation**: WCAG compliance checking with contrast ratio warnings and recommendations

### User Interface Features

#### Split-Pane Design
- **Left Panel**: Pseudocode input with syntax highlighting
- **Right Panel**: Real-time flowchart visualization
- **Responsive Layout**: Adjustable to different screen sizes

#### Interactive Elements
- **Block Type Dropdown**: Click lines ending with `::` to change block types
- **Icon Toggle**: Show/hide inline icons for better readability
- **Validation Panel**: Expandable error and warning display
- **Block Legend**: Quick reference for block types and colors

#### Accessibility & Visual Features
- **Keyboard Navigation**: Full functionality without mouse
- **Color-Blind Friendly**: Distinct shapes supplement color coding
- **Screen Reader Support**: Semantic HTML structure
- **High Contrast Mode**: Enhanced visibility with WCAG AAA compliance
- **Reduced Motion Support**: Respects user motion preferences
- **Real-time Contrast Validation**: Live accessibility compliance checking
- **5 Professional Color Schemes**: Customizable depth visualization themes
- **Dynamic Depth Gradients**: Visual intensity mapping for stack depth understanding
- **Interactive Accessibility Demo**: Built-in demonstration of all accessibility features

## 📊 Current Development State

### ✅ Implemented Features

**Core Functionality (100% Complete)**
- [x] Natural language pseudocode parsing
- [x] Intelligent block type detection
- [x] Real-time flowchart generation
- [x] All 14 block types with professional shapes and colors
- [x] Save/load project functionality
- [x] Download capabilities (PNG export)

**Enhanced Conditional Logic (100% Complete - NEW)**
- [x] Multi-way IF/ELSE IF/ELSE chain support
- [x] Cascading layout with proper positioning
- [x] Content blocks aligned below parent conditionals
- [x] Switch/case statement visualization
- [x] Simplified connection algorithm eliminating duplicates

**Comprehensive Recursion Analysis (100% Complete - NEW)**
- [x] Parameter transformation detection (n-1, node.left, n/2, etc.)
- [x] Base case and recursive case extraction
- [x] Recursion type classification (linear, tree, tail, mutual, nested)
- [x] Stack overflow prevention with depth warnings
- [x] Recursive function call marking in main flow

**Interactive Stack Frame Visualization (100% Complete - NEW)**
- [x] Individual stack frame components with active/inactive states
- [x] Variable tracking with parameter and local variable display
- [x] Type highlighting and change detection
- [x] Overflow handling for deep stacks (100+ frames)
- [x] Collapse/expand functionality with bulk operations
- [x] Performance optimization with efficient rendering

**Advanced Depth Visualization System (100% Complete - NEW)**
- [x] Dynamic color gradient system with 5 professional themes
- [x] Depth-based intensity mapping (light to dark progression)
- [x] Smart collapsible sections with auto-collapse for deep stacks
- [x] Interactive depth counters with urgency indicators
- [x] WCAG AA/AAA accessibility compliance validation
- [x] Real-time contrast ratio checking and warnings
- [x] High contrast mode and reduced motion support
- [x] Live accessibility settings with instant preview

**Comprehensive Animation System (100% Complete - NEW)**
- [x] Smooth frame entry/exit animations with configurable speeds
- [x] Staggered batch operations for multiple frame changes
- [x] Advanced animation queuing with performance optimization
- [x] Real-time FPS monitoring and adaptive performance
- [x] User-controllable animation settings (speed, easing, motion)
- [x] Accessibility integration with reduced motion compliance
- [x] Interactive animation demo with factorial recursion example

**Integrated Stack Visualization (100% Complete - NEW)**
- [x] Side-by-side layout with flowchart and stack panels
- [x] Responsive design with auto-collapse for small screens
- [x] Toggle stack panel position between left and right
- [x] Function block click synchronization with stack frames
- [x] Smart stack frame generation based on function metadata
- [x] Recursive function detection with deep stack simulation
- [x] Proper z-index layering for popups and panels
- [x] One-click demo button for recursive examples

**Advanced Visualization (100% Complete)**
- [x] Enhanced YES/NO branching with optimized label positioning
- [x] Loop visualization with depth indicators and color coding
- [x] Function definition extraction and popup display
- [x] Interactive movable function windows
- [x] Right-angle connections with professional styling
- [x] Infinite canvas with pan/zoom and auto-fit

**User Experience (100% Complete)**
- [x] Split-pane interface
- [x] Interactive block type selection
- [x] Icon toggle functionality
- [x] Real-time validation
- [x] Error/warning display
- [x] Block type legend

**Technical Foundation (100% Complete)**
- [x] React-based architecture
- [x] SVG rendering engine
- [x] LocalStorage persistence
- [x] Responsive design
- [x] Error handling

### 🔧 Known Issues & Limitations

**Minor Issues**
- Very long text in blocks may be truncated with ellipsis
- Complex deeply nested structures may require manual layout adjustment
- Function parameter parsing relies on specific syntax patterns
- Animation performance may vary on low-end devices (auto-optimization enabled)

**Browser Compatibility**
- Tested on Chrome, Firefox, Safari, Edge (latest versions)
- Full functionality requires modern browser with ES6+ support
- SVG export may have minor rendering differences across browsers
- Animation features require requestAnimationFrame support (IE11+ not supported)
- Advanced accessibility features work best in modern browsers with full CSS custom property support

## 🚧 Future Development Roadmap

### Phase 1: Enhanced Core Features (Near-term)

#### 🎯 Advanced Algorithm Support
- [ ] **Nested Loop Visualization**
  - Multi-level loop indentation
  - Visual depth indicators
  - Smart routing for complex nesting

- [ ] **Function Definition Blocks**
  - Callable function visualization
  - Parameter and return value display
  - Function call mapping

- [x] **Enhanced Conditional Logic** ✅ **COMPLETED**
  - Multi-way IF-ELSE chains with cascading layout
  - Switch/case statement support with proper visualization
  - Nested conditional handling with smart positioning

#### 📱 Improved User Experience
- [ ] **Advanced Text Editor**
  - Syntax highlighting for pseudocode
  - Auto-completion for common patterns
  - Code folding for large algorithms

- [ ] **Export Enhancements**
  - SVG vector export
  - PDF generation with metadata
  - Multiple image formats (JPEG, WebP)
  - Code generation (Python, JavaScript, etc.)

- [ ] **Collaboration Features**
  - Real-time collaborative editing
  - Comment system for blocks
  - Version control with diff visualization

### Phase 2: Intelligence & Analysis (Medium-term)

#### 🧠 Algorithm Analysis
- [ ] **Complexity Analysis**
  - Big O notation calculation
  - Performance bottleneck identification
  - Optimization suggestions

- [ ] **Code Quality Metrics**
  - Cyclomatic complexity measurement
  - Maintainability index
  - Best practice recommendations

- [ ] **Smart Validation**
  - Logic error detection
  - Unreachable code identification
  - Variable usage analysis

#### 🎨 Advanced Visualization
- [ ] **Multiple Diagram Types**
  - Sequence diagrams for process flows
  - State machine diagrams
  - Data flow diagrams
  - UML activity diagrams

- [ ] **Interactive Execution**
  - Step-through algorithm execution
  - Variable state visualization
  - Debugging support with breakpoints

- [ ] **Theming & Customization**
  - Custom color schemes
  - Corporate branding support
  - Accessibility themes (high contrast, dark mode)

### Phase 3: Platform & Integration (Long-term)

#### 🌐 Platform Expansion
- [ ] **Desktop Application**
  - Electron-based standalone app
  - Offline functionality
  - File system integration

- [ ] **Web API**
  - RESTful API for programmatic access
  - Batch processing capabilities
  - Third-party integrations

- [ ] **Educational Platform**
  - Curriculum integration
  - Student progress tracking
  - Assignment management system

#### 🔗 Integration Capabilities
- [ ] **Development Tool Integration**
  - VS Code extension
  - GitHub integration
  - CI/CD pipeline support

- [ ] **Documentation Platforms**
  - Confluence plugin
  - Notion integration
  - WordPress widget

- [ ] **Learning Management Systems**
  - Canvas integration
  - Moodle plugin
  - Blackboard support

## 🛠️ Development Setup

### Prerequisites
```bash
Node.js >= 16.0.0
npm >= 8.0.0
```

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/algorithm-visualizer.git

# Navigate to project directory
cd algorithm-visualizer

# Install dependencies
npm install

# Start development server
npm start
```

### Build for Production
```bash
# Create optimized production build
npm run build

# Serve production build locally
npm run serve
```

### Testing
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

## 📖 Usage Examples

### Basic Algorithm
```
Start the algorithm::
Get user input for number n::
Set counter to 1::
While counter is less than or equal to n::
  Display counter::
  Add 1 to counter::
End while loop::
Display "Done"::
End algorithm::
```

### Complex Algorithm with Enhanced Conditional Logic
```
Start::
Input grade::
If grade >= 90::
  Output "A"::
Else if grade >= 80::
  Output "B"::
Else::
  Output "C"::
End if::
End::
```

### Switch Statement Example
```
Start::
Input day number::
Switch day::
Case 1::
  Output "Monday"::
Case 2::
  Output "Tuesday"::
Default::
  Output "Invalid day"::
End switch::
End::
```

### Algorithm with Functions
```
Start the algorithm::
Call function to initialize data::
For each item in list::
  Call function to process item::
  Display result::
End for loop::
Call function to cleanup::
End algorithm::
```

### Recursive Algorithm Example
```
Start::
Input n::
Call factorial(n)::
Output result::
End::

Function factorial(n)::
  If n <= 1::
    Return 1::
  End if::
  Return n * call factorial(n-1)::
End function::
```

### Tree Traversal with Stack Visualization
```
Start::
Input tree root::
Call traverse(root)::
End::

Function traverse(node)::
  If node is null::
    Return::
  End if::
  Process node::
  Call traverse(node.left)::
  Call traverse(node.right)::
End function::
```

## 🎬 Interactive Animation Demo

The application includes a comprehensive **Enhanced Depth Visualization Demo** accessible via the "Animation Demo" button in the header. This demo showcases:

### 🎯 Demo Features
- **Deep Recursion Simulation**: factorial(15) creating 16 stack frames
- **Real-time Depth Visualization**: Watch color gradients change as stack grows
- **Smart Collapsible Sections**: Auto-collapse deep sections for performance
- **Interactive Controls**: Play/pause/reset with speed controls
- **Live Accessibility Testing**: Real-time contrast ratio validation
- **5 Color Schemes**: Switch between Blue, Warm, Cool, Rainbow, and Monochrome themes
- **Performance Monitoring**: See adaptive optimization in action

### 🎮 How to Use
1. **Click "Animation Demo"** in the top-right corner of the main application
2. **Use Controls**: Play/pause/reset the factorial recursion animation
3. **Experiment with Settings**: Toggle accessibility options and color schemes
4. **View Legend**: See depth levels and their visual indicators
5. **Test Accessibility**: View real-time contrast ratios and compliance levels

### 🔧 What You'll Learn
- How depth gradients improve stack visualization
- The importance of accessibility in technical applications
- Performance optimization techniques for large data sets
- Smart UI patterns for handling complex nested structures

## 🤝 Contributing

### How to Contribute
1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow React best practices and hooks patterns
- Use TypeScript for type safety
- Write comprehensive tests for new features
- Update documentation for any API changes
- Follow the existing code style and conventions

### Bug Reports
When reporting bugs, please include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Sample pseudocode that causes the issue

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Inspiration**: Traditional flowcharting principles and modern algorithm visualization needs
- **Design**: Influenced by professional diagramming tools like Lucidchart and Visio
- **Community**: Thanks to all contributors and users providing feedback for improvements

## 📞 Support & Contact

- **Documentation**: [Project Wiki](https://github.com/your-username/algorithm-visualizer/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/algorithm-visualizer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/algorithm-visualizer/discussions)
- **Email**: support@algorithmvisualizer.com

---

**Made with ❤️ for the algorithm design and education community**