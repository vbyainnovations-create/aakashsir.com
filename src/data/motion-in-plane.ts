export const motionInPlaneTheory = String.raw`
<div align="center">
  <h1><strong>Class 11 Physics: Motion in a Plane</strong></h1>
  <br/>
  <h2><strong>CBSE / NCERT Syllabus Study Notes</strong></h2>
</div>

<hr/>

## 1. Scalars and Vectors
Physics quantities in 2D are handled using vectors to account for direction.

### Key Differences

| **Feature** | **Scalar Quantity** | **Vector Quantity** |
| :--- | :--- | :--- |
| Definition | Has only magnitude. | Has both magnitude and direction. |
| Algebra | Simple arithmetic rules. | Vector addition laws (Triangle/Parallelogram). |
| Resolution | Cannot be resolved. | Can be resolved into orthogonal components. |
| Examples | Mass, Distance, Speed. | Displacement, Velocity, Force. |

### Important Definitions
* **Unit Vector:** $\hat{n} = \frac{\vec{A}}{|\vec{A}|}$. It has a magnitude of 1 and specifies direction.
* **Resolution of Vectors:** A vector $\vec{A}$ in a plane can be split into:
  * $A_x = A \cos \theta$ (Horizontal component)
  * $A_y = A \sin \theta$ (Vertical component)

\`\`\`tikz
\begin{tikzpicture}[>=Stealth, thick]
    % Draw Axes
    \draw[->, gray] (0,0) -- (4.5,0) node[right, black] {$x$};
    \draw[->, gray] (0,0) -- (0,3.5) node[above, black] {$y$};
    \node[below left] at (0,0) {O};
    % Main Vector A
    \draw[->, blue, very thick] (0,0) coordinate (O) -- (4,3) coordinate (A_tip) node[midway, above left, black] {$\vec{A}$};
    % Projection lines
    \draw[dashed, red] (4,0) -- (4,3);
    \draw[dashed, red] (0,3) -- (4,3);
    % Components
    \draw[->, red, ultra thick] (0,0) -- (4,0) node[midway, below] {$A_x = A\cos\theta$};
    \draw[->, red, ultra thick] (0,0) -- (0,3) node[midway, left] {$A_y = A\sin\theta$};
    % Angle
    \coordinate (X) at (1,0);
    \pic [draw, ->, "$\theta$", angle eccentricity=1.5] {angle = X--O--A_tip};
\end{tikzpicture}
\`\`\`

## 2. Vector Addition Laws
The resultant $\vec{R}$ of two vectors $\vec{A}$ and $\vec{B}$ at an angle $\theta$:
$$R = \sqrt{A^2 + B^2 + 2AB \cos\theta} \quad ; \quad \tan\alpha = \frac{B \sin\theta}{A + B \cos\theta}$$

\`\`\`tikz
\begin{tikzpicture}[>=Stealth, thick]
    \draw[->, red, very thick] (0,0) coordinate (O) -- (3,0) coordinate (A) node[midway, below] {$\vec{A}$};
    \draw[->, blue, very thick] (0,0) -- (1,2) coordinate (B) node[midway, above left] {$\vec{B}$};
    \draw[dashed] (A) -- ($(A)+(B)$) coordinate (C);
    \draw[dashed] (B) -- (C);
    \draw[->, violet, ultra thick] (O) -- (C) node[midway, above] {$\vec{R} = \vec{A}+\vec{B}$};
    \pic [draw, <->, "$\theta$", angle eccentricity=1.3, angle radius=0.6cm] {angle = A--O--B};
    \pic [draw, ->, "$\alpha$", angle eccentricity=1.5, angle radius=1cm] {angle = A--O--C};
\end{tikzpicture}
\`\`\`

## 3. Projectile Motion
A projectile is an object in flight under gravity. Horizontal and vertical motions are independent.

* **Horizontal:** $a_x = 0$, $v_x = u \cos \theta$ (Constant).
* **Vertical:** $a_y = -g$, $v_y = u \sin \theta - gt$ (Variable).

\`\`\`tikz
\begin{tikzpicture}[>=Stealth, thick, scale=0.9]
    \draw[->, gray] (0,0) -- (9,0) node[right, black] {$x$};
    \draw[->, gray] (0,0) -- (0,5) node[above, black] {$y$};
    \draw[blue, thick, domain=0:8, samples=100] plot (\x, {1.5*\x - 0.1875*\x*\x});
    
    % Launch Vector
    \draw[->, black, very thick] (0,0) -- (1,1.5) node[above] {$\vec{u}$};
    \pic [draw, "$\theta$", angle eccentricity=1.5, angle radius=0.5cm] {angle = 1,0--0,0--1,1.5};
    
    % Max Height
    \draw[dashed] (4,0) -- (4,3) node[midway, right] {$H_{max}$};
    \draw[->, red] (4,3) -- (5,3) node[right] {$v = u_x$};
    
    % Range
    \draw[<->] (0,-0.5) -- (8,-0.5) node[midway, below] {Range ($R$)};
\end{tikzpicture}
\`\`\`

### Key Formulas
1. **Time of Flight:** $T = \frac{2u \sin\theta}{g}$
2. **Max Height:** $H = \frac{u^2 \sin^2\theta}{2g}$
3. **Horizontal Range:** $R = \frac{u^2 \sin 2\theta}{g}$
4. **Trajectory Equation:** $y = x \tan\theta - \frac{gx^2}{2u^2 \cos^2\theta}$

## 4. Uniform Circular Motion
Motion at constant speed in a circle. Velocity direction changes, creating acceleration.

* **Centripetal Acceleration:** $a_c = \frac{v^2}{r} = \omega^2 r$. Points toward the center.
* **Relationship:** $v = \omega r$.

\`\`\`tikz
\begin{tikzpicture}[>=Stealth, thick]
    \draw[gray] (0,0) circle (2cm);
    \draw[->, violet] (0,0) -- (1.28, 1.53) coordinate (A) node[midway, left] {$r$};
    \filldraw (A) circle (2pt);
    \draw[->, blue, ultra thick] (A) -- ($(A)!1.2cm!-90:(0,0)$) node[right] {$\vec{v}$};
    \draw[->, red, ultra thick] (A) -- (0,0) node[midway, right] {$\vec{a}_c$};
    \node at (0,0) [below left] {O};
\end{tikzpicture}
\`\`\`
`;
